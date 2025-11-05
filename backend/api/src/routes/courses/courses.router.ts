import express, { Router } from "express";
import {
  getCourseDetails,
  getSpecificCourses,
  getTopNCoursesForCompetence,
  getCoursesOfSemester,
} from "./courses.controller";

const router: Router = express.Router();
//false: only support simple bodys, true would support rich data
router.use(express.urlencoded({ extended: false }));
//json data will be extracted
router.use(express.json());

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         m_id:
 *           type: string
 *           description: Module id
 *           example: 10
 *         version:
 *           type: integer
 *           description: Module version number
 *           example: 5
 *         name:
 *           type: string
 *           description: Module name
 *           example: Computergrafik und Animation
 *         content:
 *           type: string
 *           description: Module content
 *           example: The module is about...
 *         skills:
 *           type: string
 *           description: Module skills
 *           example: Students learn how to discuss the topic of...
 *         add_info:
 *           type: string
 *           description: Other additional content from the module handbook
 *           example: The module is offered in English.
 *         prior_knowledge:
 *           type: string
 *           description: Prior knowledge for the module in textual form.
 *           example: Basic knowledge in the topic of...
 *         ects:
 *           type: number
 *           description: Module's credit points
 *           example: 6
 *         term:
 *           type: string
 *           description: The term the module is offered in
 *           example: WS, SS
 *         rec_term:
 *           type: string
 *           description: The term the module handbook recommends the module should be taken in.
 *           example: 1-2
 *         duration:
 *           type: string
 *           description: The duration of the module in semesters
 *           example: 1
 *         chair:
 *           type: string
 *           description: The chair that offers the module
 *           example: Lehrstuhl für Computergrafik
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

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
 *         example: TODO
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester of course
 *         example: TODO
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: The requested course could not be found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         example: 2025s
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: The requested courses could not be found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:semester", getCoursesOfSemester);

// 
/**
 * @swagger
 * /courses/{semester}/{competence}/{topN}:
 *   get:
 *     summary: Get top n courses of those who fulfill given competence group the most for given semester
 *     tags: [Courses - BilApp]
 *     parameters:
 *       - in: path
 *         name: competence
 *         required: true
 *         schema:
 *           type: TODO
 *         description: Competence
 *         example: TODO
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester
 *         example: 2025s
 *       - in: path
 *         name: topN
 *         required: true
 *         schema:
 *           type: integer
 *         description: Top n
 *         example: 3
 *     responses:
 *       200:
 *         description: Array of courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: TODO - 2x Bad Request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:semester/:competence/:topN", getTopNCoursesForCompetence);

/**
 * @swagger
 * /courses/{semester}/{searchTerm}:
 *   get:
 *     summary: Get courses with a specific search term (e.g. LAMOD-01 for all EWS-Courses)
 *     tags: [Courses - BilApp]
 *     parameters:
 *       - in: searchTerm
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *         example: LAMOD-01
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester
 *         example: TODO
 *     responses:
 *       200:
 *         description: Module handbook
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: The request was invalid or malformed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: The requested resource could not be found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:semester/:searchTerm", getSpecificCourses);

export { router as courses };
