import dotenv from "dotenv";
dotenv.config();

import "./cron/staffSchedule";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import staffRoutes from "./routes/staffRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import availabilityRoutes from "./routes/availabilityRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import emailRoutes from "./routes/emailRoutes";
import { updatePassedAppointments } from "./controllers/appointmentController";
import reviewRoutes from "./routes/reviewRoute";

const app = express();

app.use(helmet());
app.disable("x-powered-by");

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.send("Salon Booking Backend API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Start background status updates for passed appointments every 30 seconds
    setInterval(async () => {
      try {
        await updatePassedAppointments();
      } catch (err) {
        console.error("Background passed appointments status updater error:", err);
      }
    }, 30000);
  } catch (error) {
    console.log("Database connection error:", error);
    process.exit(1);
  }
};

startServer();