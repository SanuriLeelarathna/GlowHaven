import express from "express";
import {
  getAvailableStaffForService,
  getAvailableTimeSlotsForStaff,
} from "../controllers/availabilityController";

const router = express.Router();

router.get("/service-based", getAvailableStaffForService);
router.get("/staff-based", getAvailableTimeSlotsForStaff);

export default router;