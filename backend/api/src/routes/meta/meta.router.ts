import express, { Router } from 'express';
import {
    getDistinctDepartments,
    getDistinctCourseTypes
} from './meta.controller';

const router: Router = express.Router();
router.use(express.json())

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
router.get('/departments', getDistinctDepartments);

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
router.get('/course-types', getDistinctCourseTypes);

export { router as meta };