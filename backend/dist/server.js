"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const staffRoutes_1 = __importDefault(require("./routes/staffRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const availabilityRoutes_1 = __importDefault(require("./routes/availabilityRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
const appointmentController_1 = require("./controllers/appointmentController");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Salon Booking Backend API Running");
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/services", serviceRoutes_1.default);
app.use("/api/staff", staffRoutes_1.default);
app.use("/api/appointments", appointmentRoutes_1.default);
app.use("/api/availability", availabilityRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/email", emailRoutes_1.default);
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        // Start background status updates for passed appointments every 30 seconds
        setInterval(async () => {
            try {
                await (0, appointmentController_1.updatePassedAppointments)();
            }
            catch (err) {
                console.error("Background passed appointments status updater error:", err);
            }
        }, 30000);
    }
    catch (error) {
        console.log("Database connection error:", error);
        process.exit(1);
    }
};
startServer();
