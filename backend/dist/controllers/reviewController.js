"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectReview = exports.approveReview = exports.getPendingReviews = exports.getReviews = exports.createReview = void 0;
const review_1 = __importDefault(require("../models/review"));
// Customer submit review
const createReview = async (req, res) => {
    try {
        const { name, rating, comment } = req.body;
        const review = new review_1.default({
            name,
            rating,
            comment
        });
        await review.save();
        res.status(201).json({
            message: "Review submitted successfully",
            review
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to submit review"
        });
    }
};
exports.createReview = createReview;
// Home page - approved reviews only
const getReviews = async (req, res) => {
    try {
        const reviews = await review_1.default.find({
            status: "approved"
        })
            .sort({
            createdAt: -1
        });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch reviews"
        });
    }
};
exports.getReviews = getReviews;
// Admin - get pending reviews
const getPendingReviews = async (req, res) => {
    try {
        const reviews = await review_1.default.find({
            status: "pending"
        })
            .sort({
            createdAt: -1
        });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch pending reviews"
        });
    }
};
exports.getPendingReviews = getPendingReviews;
// Admin - approve review
const approveReview = async (req, res) => {
    try {
        const review = await review_1.default.findByIdAndUpdate(req.params.id, {
            status: "approved"
        }, {
            new: true
        });
        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }
        res.json({
            message: "Review approved successfully",
            review
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to approve review"
        });
    }
};
exports.approveReview = approveReview;
// Admin - reject review
const rejectReview = async (req, res) => {
    try {
        const review = await review_1.default.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }
        res.json({
            message: "Review rejected successfully"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to reject review"
        });
    }
};
exports.rejectReview = rejectReview;
