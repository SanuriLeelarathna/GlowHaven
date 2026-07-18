"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableTimeSlotsForStaff = exports.getAvailableStaffForService = void 0;
const Staff_1 = __importDefault(require("../models/Staff"));
const service_1 = __importDefault(require("../models/service"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const appointmentController_1 = require("./appointmentController");
const timeToMinutes = (time) => {
    const normalizedTime = time.replace(".", ":");
    const [hours, minutes] = normalizedTime.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        throw new Error("Invalid time format");
    }
    return hours * 60 + minutes;
};
const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
const isTimeOverlapping = (newStart, newEnd, existingStart, existingEnd) => {
    return newStart < existingEnd && newEnd > existingStart;
};
// SERVICE-BASED BOOKING
// serviceId + date + time => available staff list
const getAvailableStaffForService = async (req, res) => {
    try {
        const { serviceId, date, time } = req.query;
        if (!serviceId || !date || !time) {
            return res.status(400).json({
                message: "serviceId, date and time are required",
            });
        }
        // Run status update before calculating availability
        await (0, appointmentController_1.updatePassedAppointments)();
        const serviceIdStr = String(serviceId);
        const dateStr = String(date);
        const timeStr = String(time);
        const service = await service_1.default.findById(serviceIdStr);
        if (!service) {
            return res.status(404).json({
                message: "Service not found",
            });
        }
        const selectedStart = timeToMinutes(timeStr);
        const selectedEnd = selectedStart + service.duration;
        const staffMembers = await Staff_1.default.find({
            services: serviceIdStr,
        }).populate("services");
        const availableStaff = [];
        for (const staff of staffMembers) {
            const appointments = await Appointment_1.default.find({
                staffId: staff._id,
                date: dateStr,
                status: { $nin: ["cancelled", "completed"] },
            });
            let isAvailable = true;
            for (const appointment of appointments) {
                const existingStart = timeToMinutes(appointment.time);
                const existingEnd = existingStart + appointment.duration;
                if (isTimeOverlapping(selectedStart, selectedEnd, existingStart, existingEnd)) {
                    isAvailable = false;
                    break;
                }
            }
            if (isAvailable) {
                availableStaff.push(staff);
            }
        }
        return res.status(200).json({
            message: "Available staff fetched successfully",
            availableStaff,
        });
    }
    catch (error) {
        console.log("Available staff error:", error);
        return res.status(500).json({
            message: "Failed to fetch available staff",
            error,
        });
    }
};
exports.getAvailableStaffForService = getAvailableStaffForService;
// STAFF-BASED BOOKING
// staffId + serviceId + date => available time slots
const getAvailableTimeSlotsForStaff = async (req, res) => {
    try {
        const { staffId, serviceId, date } = req.query;
        if (!staffId || !serviceId || !date) {
            return res.status(400).json({
                message: "staffId, serviceId and date are required",
            });
        }
        // Run status update before calculating availability
        await (0, appointmentController_1.updatePassedAppointments)();
        const staffIdStr = String(staffId);
        const serviceIdStr = String(serviceId);
        const dateStr = String(date);
        const service = await service_1.default.findById(serviceIdStr);
        if (!service) {
            return res.status(404).json({
                message: "Service not found",
            });
        }
        const staff = await Staff_1.default.findById(staffIdStr);
        if (!staff) {
            return res.status(404).json({
                message: "Staff member not found",
            });
        }
        const dayName = new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "long",
        });
        const workingDay = staff.workingHours.find((wh) => wh.day.toLowerCase() === dayName.toLowerCase());
        if (!workingDay) {
            return res.status(200).json({
                message: "Staff member is not working on this date",
                availableSlots: [],
            });
        }
        const workStart = timeToMinutes(workingDay.startTime);
        const workEnd = timeToMinutes(workingDay.endTime);
        const appointments = await Appointment_1.default.find({
            staffId: staffIdStr,
            date: dateStr,
            status: { $nin: ["cancelled", "completed"] },
        });
        const availableSlots = [];
        for (let slotStart = workStart; slotStart + service.duration <= workEnd; slotStart += 15) {
            const slotEnd = slotStart + service.duration;
            let isAvailable = true;
            for (const appointment of appointments) {
                const existingStart = timeToMinutes(appointment.time);
                const existingEnd = existingStart + appointment.duration;
                if (isTimeOverlapping(slotStart, slotEnd, existingStart, existingEnd)) {
                    isAvailable = false;
                    break;
                }
            }
            if (isAvailable) {
                availableSlots.push(minutesToTime(slotStart));
            }
        }
        return res.status(200).json({
            message: "Available time slots fetched successfully",
            availableSlots,
        });
    }
    catch (error) {
        console.log("Available time slots error:", error);
        return res.status(500).json({
            message: "Failed to fetch available time slots",
            error,
        });
    }
};
exports.getAvailableTimeSlotsForStaff = getAvailableTimeSlotsForStaff;
