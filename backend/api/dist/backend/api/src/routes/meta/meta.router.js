"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meta = void 0;
const express_1 = __importDefault(require("express"));
const meta_controller_1 = require("./meta.controller");
const router = express_1.default.Router();
exports.meta = router;
router.use(express_1.default.json());
// Get Departments
router.get('/departments', meta_controller_1.getDistinctDepartments);
// Get Course Types
router.get('/course-types', meta_controller_1.getDistinctCourseTypes);
