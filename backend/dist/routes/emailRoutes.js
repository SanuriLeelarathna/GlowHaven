"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const email_1 = __importDefault(require("../config/email"));
const router = express_1.default.Router();
router.post("/test-email", async (req, res) => {
    try {
        await email_1.default.sendMail({
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: "Salon Email Test",
            text: "Nodemailer is working successfully!",
        });
        res.status(200).json({
            message: "Email sent successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Email failed",
            error,
        });
    }
});
exports.default = router;
