import express from "express";
import { registerUser, loginUser, getCustomers } from "../controllers/authController";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/customers", getCustomers);

export default router;