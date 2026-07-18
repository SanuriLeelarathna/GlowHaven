import { Request, Response } from "express";
import Staff from "../models/Staff";
import Service from "../models/service";
import Appointment from "../models/Appointment";
import { updatePassedAppointments } from "./appointmentController";

const timeToMinutes = (time: string): number => {
  const normalizedTime = time.replace(".", ":");
  const [hours, minutes] = normalizedTime.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error("Invalid time format");
  }

  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const isTimeOverlapping = (
  newStart: number,
  newEnd: number,
  existingStart: number,
  existingEnd: number
): boolean => {
  return newStart < existingEnd && newEnd > existingStart;
};

// SERVICE-BASED BOOKING
// serviceId + date + time => available staff list
export const getAvailableStaffForService = async (
  req: Request,
  res: Response
) => {
  try {
    const { serviceId, date, time } = req.query;

    if (!serviceId || !date || !time) {
      return res.status(400).json({
        message: "serviceId, date and time are required",
      });
    }

    // Run status update before calculating availability
    await updatePassedAppointments();

    const serviceIdStr = String(serviceId);
    const dateStr = String(date);
    const timeStr = String(time);

    const service = await Service.findById(serviceIdStr);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const selectedStart = timeToMinutes(timeStr);
    const selectedEnd = selectedStart + service.duration;

    const staffMembers = await Staff.find({
      services: serviceIdStr,
    }).populate("services");

    const availableStaff = [];

    for (const staff of staffMembers) {
      const appointments = await Appointment.find({
        staffId: staff._id,
        date: dateStr,
        status: { $nin: ["cancelled", "completed"] },
      });

      let isAvailable = true;

      for (const appointment of appointments) {
        const existingStart = timeToMinutes(appointment.time);
        const existingEnd = existingStart + appointment.duration;

        if (
          isTimeOverlapping(
            selectedStart,
            selectedEnd,
            existingStart,
            existingEnd
          )
        ) {
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
  } catch (error) {
    console.log("Available staff error:", error);
    return res.status(500).json({
      message: "Failed to fetch available staff",
      error,
    });
  }
};

// STAFF-BASED BOOKING
// staffId + serviceId + date => available time slots
export const getAvailableTimeSlotsForStaff = async (
  req: Request,
  res: Response
) => {
  try {
    const { staffId, serviceId, date } = req.query;

    if (!staffId || !serviceId || !date) {
      return res.status(400).json({
        message: "staffId, serviceId and date are required",
      });
    }

    // Run status update before calculating availability
    await updatePassedAppointments();

    const staffIdStr = String(staffId);
    const serviceIdStr = String(serviceId);
    const dateStr = String(date);

    const service = await Service.findById(serviceIdStr);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const staff = await Staff.findById(staffIdStr);

    if (!staff) {
      return res.status(404).json({
        message: "Staff member not found",
      });
    }

    const dayName = new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const workingDay = staff.workingHours.find(
      (wh) => wh.day.toLowerCase() === dayName.toLowerCase()
    );

    if (!workingDay) {
      return res.status(200).json({
        message: "Staff member is not working on this date",
        availableSlots: [],
      });
    }

    const workStart = timeToMinutes(workingDay.startTime);
    const workEnd = timeToMinutes(workingDay.endTime);

    const appointments = await Appointment.find({
      staffId: staffIdStr,
      date: dateStr,
      status: { $nin: ["cancelled", "completed"] },
    });

    const availableSlots: string[] = [];

    for (
      let slotStart = workStart;
      slotStart + service.duration <= workEnd;
      slotStart += 15
    ) {
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

    // Filter out past slots if the selected date is today based on server time
    let filteredAvailableSlots = availableSlots;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (dateStr === todayStr) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      filteredAvailableSlots = availableSlots.filter(
        (slot) => timeToMinutes(slot) >= currentMinutes
      );
    }

    return res.status(200).json({
      message: "Available time slots fetched successfully",
      availableSlots: filteredAvailableSlots,
    });
  } catch (error) {
    console.log("Available time slots error:", error);
    return res.status(500).json({
      message: "Failed to fetch available time slots",
      error,
    });
  }
};