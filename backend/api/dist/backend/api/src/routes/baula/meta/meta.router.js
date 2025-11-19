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
 *     tags: [Meta::Departments]
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
 *               $ref: '#/components/schemas/NotFoundError'
 *       400:
 *         description: Es ist ein Fehler aufgetreten.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.get('/departments', meta_controller_1.getDistinctDepartments);
/**
 * @swagger
 * /meta/course-types:
 *   get:
 *     summary: Get course types
 *     tags: [Meta::Course Types]
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
 *               $ref: '#/components/schemas/NotFoundError'
 *       400:
 *         description: Es ist ein Fehler aufgetreten.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.get('/course-types', meta_controller_1.getDistinctCourseTypes);
/**
 * @swagger
 * /meta/academic-dates/{semester}:
 *   get:
 *     tags: [Meta::Dates]
 *     summary: Get all academic dates for a semester
 *     description: Retrieves all important academic dates (e.g., lecture start, exam periods) for the specified semester
 *     parameters:
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '\\d{4}((w)|(s))'
 *           example: '2024w'
 *         description: Semester identifier (format YYYYW or YYYYS)
 *     responses:
 *       200:
 *         description: Academic dates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicDate'
 *       400:
 *         description: Invalid semester format or error retrieving data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.get("/academic-dates/:semester", meta_controller_1.getAcademicDatesBySemester);
/**
 * @swagger
 * /meta/date-types:
 *   get:
 *     tags: [Meta::Dates]
 *     summary: Get all date types
 *     description: Retrieves all available academic date types (e.g., lecture period, exam period)
 *     responses:
 *       200:
 *         description: Date types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DateType'
 *       400:
 *         description: Error retrieving data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.get("/date-types", meta_controller_1.getDateTypes);
