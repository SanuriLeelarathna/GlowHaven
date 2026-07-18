"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const staffController_1 = require("../controllers/staffController");
const router = express_1.default.Router();
router.post("/", staffController_1.createStaff);
router.get("/", staffController_1.getStaff);
router.get("/:id", staffController_1.getStaffById);
router.get("/:id/services", staffController_1.getStaffServices);
router.put("/:id", staffController_1.updateStaff);
router.delete("/:id", staffController_1.deleteStaff);
exports.default = router;
