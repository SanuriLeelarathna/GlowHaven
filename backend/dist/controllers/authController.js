"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await user_1.default.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || "customer",
        });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Registration failed",
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const user = await user_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT secret is missing",
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        console.log(`Login successful: ${email} (${user.role})`);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Login failed",
        });
    }
};
exports.loginUser = loginUser;
const getCustomers = async (req, res) => {
    try {
        const customers = await user_1.default.find({ role: "customer" }).select("name email phone");
        res.status(200).json({ customers });
    }
    catch (error) {
        console.log("GET CUSTOMERS ERROR:", error);
        res.status(500).json({
            message: "Failed to fetch customers",
            error: error.message,
        });
    }
};
exports.getCustomers = getCustomers;
