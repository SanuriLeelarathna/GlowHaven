"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffServices = exports.deleteStaff = exports.updateStaff = exports.getStaffById = exports.getStaff = exports.createStaff = void 0;
const Staff_1 = __importDefault(require("../models/Staff"));
const createStaff = async (req, res) => {
    try {
        const { name, email, phone, specialization, image, services, workingHours, } = req.body;
        const existingStaff = await Staff_1.default.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ message: "Staff member already exists" });
        }
        const staff = await Staff_1.default.create({
            name,
            email,
            phone,
            specialization,
            image,
            services,
            workingHours,
        });
        return res.status(201).json({
            message: "Staff member created successfully",
            staff,
        });
    }
    catch (error) {
        console.log("Create staff error:", error);
        return res.status(500).json({
            message: "Staff creation failed",
            error,
        });
    }
};
exports.createStaff = createStaff;
const getStaff = async (req, res) => {
    try {
        const staff = await Staff_1.default.find()
            .populate("services")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Staff fetched successfully",
            staff,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch staff",
            error,
        });
    }
};
exports.getStaff = getStaff;
const getStaffById = async (req, res) => {
    try {
        const staff = await Staff_1.default.findById(req.params.id).populate("services");
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        return res.status(200).json({
            message: "Staff member fetched successfully",
            staff,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch staff member",
            error,
        });
    }
};
exports.getStaffById = getStaffById;
const updateStaff = async (req, res) => {
    try {
        const staff = await Staff_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate("services");
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        return res.status(200).json({
            message: "Staff member updated successfully",
            staff,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Staff update failed",
            error,
        });
    }
};
exports.updateStaff = updateStaff;
const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff_1.default.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        return res.status(200).json({
            message: "Staff member deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Staff delete failed",
            error,
        });
    }
};
exports.deleteStaff = deleteStaff;
const getStaffServices = async (req, res) => {
    try {
        const staff = await Staff_1.default.findById(req.params.id).populate("services");
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        return res.status(200).json({
            message: "Staff services fetched successfully",
            services: staff.services,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch staff services",
            error,
        });
    }
};
exports.getStaffServices = getStaffServices;
