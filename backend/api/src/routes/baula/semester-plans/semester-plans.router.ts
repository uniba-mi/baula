import express, { Router } from 'express';
import {
    addCourse,
    deleteCourse,
    createUserGeneratedModule,
    addModule,
    updateUserGeneratedModule,
    deleteUserGeneratedModule,
    deleteModule,
    updateSemesterPlanAimedEcts,
    initSemesterPlans,
    updateIsPastSemester,
    importSemesterPlan,
    addCourses,
    deleteCourses,
    addSemesterPlanToStudyPlan,
    deleteUserGeneratedModules
} from './semester-plans.controller';

//using router to forward request
const router: Router = express.Router();
//false: only support simple bodys, true would support rich data
router.use(express.urlencoded({ extended: false }));
//json data will be extracted
router.use(express.json());

/**
 * @swagger
 * /semester-plans:
 *   post:
 *     tags: [Semester Plans]
 *     summary: Initialize semester plans
 *     description: Creates multiple semester plans for a specific study plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semesterPlans
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *                 description: Study plan ID
 *               semesterPlans:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/SemesterPlan'
 *     responses:
 *       200:
 *         description: Semester plans created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SemesterPlan'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.post("/", initSemesterPlans);

/**
 * @swagger
 * /semester-plans/plan:
 *   post:
 *     tags: [Semester Plans]
 *     summary: Add semester plan to study plan
 *     description: Creates a new empty semester plan and adds it to the specified study plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semester
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *                 description: Study plan ID
 *               semester:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2024w'
 *                 description: Semester identifier for the new semester plan
 *     responses:
 *       200:
 *         description: Semester plan added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudyPlan'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Study plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post("/plan", addSemesterPlanToStudyPlan);

/**
 * @swagger
 * /semester-plans/plan/aimed-ects:
 *   put:
 *     tags: [Semester Plans::Meta]
 *     summary: Update aimed (target) ECTS
 *     description: Updates the target ECTS credits for a semester plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semesterPlanId
 *               - aimedEcts
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               semesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               aimedEcts:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 210
 *                 example: 30
 *                 description: Target ECTS credits
 *     responses:
 *       200:
 *         description: Aimed ECTS updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SemesterPlan'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/plan/aimed-ects", updateSemesterPlanAimedEcts);

/**
 * @swagger
 * /semester-plans/plan/past-semester:
 *   put:
 *     tags: [Semester Plans::Meta]
 *     summary: Update past semester status
 *     description: Updates the isPastSemester property of a semester plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semesterPlanId
 *               - isPast
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               semesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               isPast:
 *                 type: boolean
 *                 example: true
 *                 description: Whether this is a past semester
 *     responses:
 *       200:
 *         description: Past semester status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SemesterPlan'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/plan/past-semester", updateIsPastSemester);

/**
 * @swagger
 * /semester-plans/plan/courses:
 *   post:
 *     tags: [Semester Plans::Courses (Stundenplanung)]
 *     summary: Add multiple courses to semester plan
 *     description: Adds multiple courses to a semester plan at once, filtering out duplicates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - semester
 *               - courses
 *               - isPastSemester
 *             properties:
 *               semester:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2024w'
 *               courses:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/SemesterPlanCourse'
 *               isPastSemester:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Courses added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/SemesterPlanCourse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Study plan or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post("/plan/courses", addCourses);

/**
 * @swagger
 * /semester-plans/plan/course:
 *   post:
 *     tags: [Semester Plans::Courses (Stundenplanung)]
 *     summary: Add course to semester plan
 *     description: Adds a single course to a semester plan of the user's active study plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - semester
 *               - course
 *               - isPastSemester
 *             properties:
 *               semester:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2024w'
 *                 description: Semester identifier
 *               course:
 *                 $ref: '#/components/schemas/SemesterPlanCourse'
 *               isPastSemester:
 *                 type: boolean
 *                 example: true
 *                 description: Whether this is a past semester
 *     responses:
 *       200:
 *         description: Course added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Study plan or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post("/plan/course", addCourse);

/**
 * @swagger
 * /semester-plans:
 *   put:
 *     tags: [Semester Plans]
 *     summary: Import semester plan
 *     description: Replaces an existing semester plan with an imported semester plan template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - semester
 *               - semesterPlan
 *             properties:
 *               semester:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2024w'
 *                 description: Semester identifier
 *               semesterPlan:
 *                  $ref: '#/components/schemas/SemesterPlan'
 *     responses:
 *       200:
 *         description: Semester plan imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SemesterPlan'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Study plan not found or semester mismatch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/", importSemesterPlan);

/**
 * @swagger
 * /semester-plans/plan/courses:
 *   delete:
 *     tags: [Semester Plans::Courses (Stundenplanung)]
 *     summary: Delete multiple courses from semester plan
 *     description: Removes multiple courses from a semester plan at once
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - semester
 *               - courseIds
 *             properties:
 *               semester:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2024w'
 *               courseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['C1', 'C2']
 *                 description: Array of course IDs to delete
 *     responses:
 *       200:
 *         description: Courses deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *               description: Updated courses array
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Study plan or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/plan/courses", deleteCourses);

/**
 * @swagger
 * /semester-plans/plan/course:
 *   delete:
 *     tags: [Semester Plans::Courses (Stundenplanung)]
 *     summary: Delete course from semester plan
 *     description: Removes a single course from a semester plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - semester
 *               - courseId
 *             properties:
 *               semester:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2024w'
 *               courseId:
 *                 type: string
 *                 example: 'C1'
 *                 description: Course ID to delete
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *               description: Updated courses array
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Study plan or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/plan/course", deleteCourse);

/**
 * @swagger
 * /semester-plans/plan/module:
 *   post:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Add module to semester (plan)
 *     description: Adds a module (by acronym) to a specific semester (plan)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semesterPlanId
 *               - module
 *               - ects
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               semesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               module:
 *                 type: string
 *                 example: 'MOD-A'
 *                 description: Module acronym
 *               ects:
 *                 type: number
 *                 example: 5.0
 *     responses:
 *       200:
 *         description: Module added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: 'MOD-A'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post("/plan/module", addModule);

/**
 * @swagger
 * /semester-plans/plan/user-generated-module:
 *   post:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Create user-generated module
 *     description: Creates and adds a user-generated (custom) module to a semester plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semesterPlanId
 *               - module
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               semesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               module:
 *                 $ref: '#/components/schemas/UserGeneratedModule'
 *     responses:
 *       200:
 *         description: User-generated module created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGeneratedModule'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post("/plan/user-generated-module", createUserGeneratedModule);

/**
 * @swagger
 * /semester-plans/plan/user-generated-module:
 *   put:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Update user-generated module
 *     description: Updates properties of a user-generated module in a semester plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semesterPlanId
 *               - moduleId
 *               - module
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               semesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               moduleId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *                 description: ID of the user-generated module to update
 *               module:
 *                 $ref: '#/components/schemas/UserGeneratedModule'
 *     responses:
 *       200:
 *         description: User-generated module updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGeneratedModule'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Study plan, semester plan, or module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/plan/user-generated-module", updateUserGeneratedModule);

/**
 * @swagger
 * /semester-plans/plan/module:
 *   delete:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Delete module from semester plan
 *     description: Removes a module (by acronym) from a semester plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semesterPlanId
 *               - module
 *               - ects
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               semesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               module:
 *                 type: string
 *                 example: 'MOD-A'
 *                 description: Module acronym to delete
 *               ects:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Module deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ['MOD-A']
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Module or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/plan/module", deleteModule);

/**
 * @swagger
 * /semester-plans/plan/user-generated-modules:
 *   delete:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Delete multiple user-generated modules
 *     description: Removes multiple user-generated modules from a semester plan at once
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semesterPlanId
 *               - moduleIds
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               semesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               moduleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['MOD-A', 'MOD-B']
 *                 description: Array of module IDs to delete
 *     responses:
 *       200:
 *         description: User-generated modules deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserGeneratedModule'
 *               description: Array of deleted modules
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Semester plan or modules not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/plan/user-generated-modules", deleteUserGeneratedModules);

/**
 * @swagger
 * /semester-plans/plan/user-generated-module:
 *   delete:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Delete user-generated module
 *     description: Removes a user-generated module from a semester plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlanId
 *               - semesterPlanId
 *               - module
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               semesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *               module:
 *                 $ref: '#/components/schemas/UserGeneratedModule'
 *     responses:
 *       200:
 *         description: User-generated module deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserGeneratedModule'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Semester plan or module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/plan/user-generated-module", deleteUserGeneratedModule);

export { router as semesterPlans }