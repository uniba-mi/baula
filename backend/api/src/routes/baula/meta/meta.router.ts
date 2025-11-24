import express, { Router } from 'express';
import {
    getDistinctDepartments,
    getDistinctCourseTypes,
    getAcademicDatesBySemester,
    getDateTypes
} from './meta.controller';

const router: Router = express.Router();
router.use(express.json())

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
router.get('/departments', getDistinctDepartments);

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
router.get('/course-types', getDistinctCourseTypes);

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
 *         description: Semester identifier (format YYYYw or YYYYs)
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
router.get("/academic-dates/:semester", getAcademicDatesBySemester);

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
router.get("/date-types", getDateTypes);

export { router as meta };