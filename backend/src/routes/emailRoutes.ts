import express from "express";
import transporter from "../config/email";

const router = express.Router();

router.post("/test-email", async (req, res) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: "Salon Email Test",
            text: "Nodemailer is working successfully!",
        });

        res.status(200).json({
            message: "Email sent successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: "Email failed",
            error,
        });
    }
});

export default router;