import { Request, Response } from "express";
import Service from "../models/service";

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration, image, category } = req.body;

    const service = await Service.create({
      name,
      description,
      price,
      duration,
      image,
      category,
    });

    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Service creation failed",
      error,
    });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find()
      .populate("category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Services fetched successfully",
      services,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch services",
      error,
    });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id).populate("category");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({
      message: "Service fetched successfully",
      service,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch service",
      error,
    });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration, image, category } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, price, duration, image, category },
      { new: true }
    ).populate("category");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Service update failed",
      error,
    });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Service delete failed",
      error,
    });
  }
};
