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
/**
 * @swagger
 * /meta/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Meta - Departments]
 *     responses:
 *       200:
 *         description: String array of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       404:
 *         description: Keine Einrichtungen gefunden.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Es ist ein Fehler aufgetreten.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/departments', meta_controller_1.getDistinctDepartments);
/**
 * @swagger
 * /meta/course-types:
 *   get:
 *     summary: Get course types
 *     tags: [Meta - Course Types]
 *     responses:
 *       200:
 *         description: String array of types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       404:
 *         description: Keine Kurstypen gefunden.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Es ist ein Fehler aufgetreten.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/course-types', meta_controller_1.getDistinctCourseTypes);
