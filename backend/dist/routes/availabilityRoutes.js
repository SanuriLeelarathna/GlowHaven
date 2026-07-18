"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const availabilityController_1 = require("../controllers/availabilityController");
const router = express_1.default.Router();
router.get("/service-based", availabilityController_1.getAvailableStaffForService);
router.get("/staff-based", availabilityController_1.getAvailableTimeSlotsForStaff);
exports.default = router;
