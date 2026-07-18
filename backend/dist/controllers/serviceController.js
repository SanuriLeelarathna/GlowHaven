"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.getServiceById = exports.getServices = exports.createService = void 0;
const service_1 = __importDefault(require("../models/service"));
const createService = async (req, res) => {
    try {
        const { name, description, price, duration, image, category } = req.body;
        const service = await service_1.default.create({
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Service creation failed",
            error,
        });
    }
};
exports.createService = createService;
const getServices = async (req, res) => {
    try {
        const services = await service_1.default.find()
            .populate("category")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Services fetched successfully",
            services,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch services",
            error,
        });
    }
};
exports.getServices = getServices;
const getServiceById = async (req, res) => {
    try {
        const service = await service_1.default.findById(req.params.id).populate("category");
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(200).json({
            message: "Service fetched successfully",
            service,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch service",
            error,
        });
    }
};
exports.getServiceById = getServiceById;
const updateService = async (req, res) => {
    try {
        const { name, description, price, duration, image, category } = req.body;
        const service = await service_1.default.findByIdAndUpdate(req.params.id, { name, description, price, duration, image, category }, { new: true }).populate("category");
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(200).json({
            message: "Service updated successfully",
            service,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Service update failed",
            error,
        });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    try {
        const service = await service_1.default.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(200).json({
            message: "Service deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Service delete failed",
            error,
        });
    }
};
exports.deleteService = deleteService;
