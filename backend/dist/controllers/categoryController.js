"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const createCategory = async (req, res) => {
    try {
        const { name, description, image, status } = req.body;
        const category = await Category_1.default.create({
            name,
            description,
            image,
            status,
        });
        return res.status(201).json({
            message: "Category created successfully",
            category,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Category creation failed",
            error,
        });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        const categories = await Category_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Categories fetched successfully",
            categories,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch categories",
            error,
        });
    }
};
exports.getCategories = getCategories;
const getCategoryById = async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }
        return res.status(200).json({
            message: "Category fetched successfully",
            category,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch category",
            error,
        });
    }
};
exports.getCategoryById = getCategoryById;
const updateCategory = async (req, res) => {
    try {
        const category = await Category_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }
        return res.status(200).json({
            message: "Category updated successfully",
            category,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Category update failed",
            error,
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const category = await Category_1.default.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }
        return res.status(200).json({
            message: "Category deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Category delete failed",
            error,
        });
    }
};
exports.deleteCategory = deleteCategory;
