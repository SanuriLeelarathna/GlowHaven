import express from "express";

import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  updateAppointment,
} from "../controllers/appointmentController";

const router = express.Router();

router.post("/", createAppointment);
router.get("/", getAppointments);
router.get("/server-time", (req, res) => {
  res.json({ serverTime: new Date().toISOString() });
});
router.get("/:id", getAppointmentById);
router.put("/:id/status", updateAppointmentStatus);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;