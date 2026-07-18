import express from "express";

import {
    createReview,
    getReviews,
    getPendingReviews,
    approveReview,
    rejectReview
} from "../controllers/reviewController";


const router = express.Router();


// ===============================
// Customer Submit Review
// POST /api/reviews
// ===============================

router.post(
    "/",
    createReview
);



// ===============================
// Home Page Reviews
// GET /api/reviews
// Only approved reviews
// ===============================

router.get(
    "/",
    getReviews
);



// ===============================
// Admin Get Pending Reviews
// GET /api/reviews/pending
// ===============================

router.get(
    "/pending",
    getPendingReviews
);



// ===============================
// Admin Approve Review
// PUT /api/reviews/approve/:id
// ===============================

router.put(
    "/approve/:id",
    approveReview
);



// ===============================
// Admin Reject Review
// DELETE /api/reviews/reject/:id
// ===============================

router.delete(
    "/reject/:id",
    rejectReview
);



export default router;