import { Request, Response } from "express";
import Category from "../models/Category";

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, description, image, status } = req.body;

        const category = await Category.create({
            name,
            description,
            image,
            status,
        });

        return res.status(201).json({
            message: "Category created successfully",
            category,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Category creation failed",
            error,
        });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Categories fetched successfully",
            categories,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch categories",
            error,
        });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        return res.status(200).json({
            message: "Category fetched successfully",
            category,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch category",
            error,
        });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        return res.status(200).json({
            message: "Category updated successfully",
            category,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Category update failed",
            error,
        });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Category delete failed",
            error,
        });
    }
};