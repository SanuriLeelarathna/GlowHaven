import { Request, Response } from "express";
import Staff from "../models/Staff";

export const createStaff = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      image,
      services,
      workingHours,
    } = req.body;

    const existingStaff = await Staff.findOne({ email });

    if (existingStaff) {
      return res.status(400).json({ message: "Staff member already exists" });
    }

    const staff = await Staff.create({
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
  } catch (error) {
    console.log("Create staff error:", error);
    return res.status(500).json({
      message: "Staff creation failed",
      error,
    });
  }
};

export const getStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.find()
      .populate("services")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Staff fetched successfully",
      staff,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch staff",
      error,
    });
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.findById(req.params.id).populate("services");

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.status(200).json({
      message: "Staff member fetched successfully",
      staff,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch staff member",
      error,
    });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("services");

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.status(200).json({
      message: "Staff member updated successfully",
      staff,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Staff update failed",
      error,
    });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.status(200).json({
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Staff delete failed",
      error,
    });
  }
};

export const getStaffServices = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.findById(req.params.id).populate("services");

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.status(200).json({
      message: "Staff services fetched successfully",
      services: staff.services,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch staff services",
      error,
    });
  }
};