"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const router = express_1.default.Router();
// ===============================
// Customer Submit Review
// POST /api/reviews
// ===============================
router.post("/", reviewController_1.createReview);
// ===============================
// Home Page Reviews
// GET /api/reviews
// Only approved reviews
// ===============================
router.get("/", reviewController_1.getReviews);
// ===============================
// Admin Get Pending Reviews
// GET /api/reviews/pending
// ===============================
router.get("/pending", reviewController_1.getPendingReviews);
// ===============================
// Admin Approve Review
// PUT /api/reviews/approve/:id
// ===============================
router.put("/approve/:id", reviewController_1.approveReview);
// ===============================
// Admin Reject Review
// DELETE /api/reviews/reject/:id
// ===============================
router.delete("/reject/:id", reviewController_1.rejectReview);
exports.default = router;
