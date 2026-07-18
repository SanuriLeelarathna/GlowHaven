import express from "express";
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffServices,
} from "../controllers/staffController";

const router = express.Router();

router.post("/", createStaff);
router.get("/", getStaff);
router.get("/:id", getStaffById);
router.get("/:id/services", getStaffServices);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;