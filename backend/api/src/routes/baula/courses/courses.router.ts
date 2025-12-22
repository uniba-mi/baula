import express, { Router } from "express";
import {
  getCourseDetails,
  getCoursesBySemester,
} from "./courses.controller";

const router: Router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

/**
 * @swagger
 * /courses/{id}/{semester}:
 *   get:
 *     summary: Get the details of a specific course by id and semester
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course id
 *         example: CourseA
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester of course
 *         example: 2024w
 *     responses:
 *       200:
 *         description: Get course with details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: The request was invalid or malformed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: The requested course could not be found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get("/:id/:semester", getCourseDetails);

/**
 * @swagger
 * /courses/{semester}:
 *   get:
 *     summary: Perform search query on courses
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester
 *         example: 2024w
 *     responses:
 *       200:
 *         description: Array of courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: The request was invalid or malformed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: The requested courses could not be found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get("/:semester", getCoursesBySemester);

export { router as courses };
