"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.semesterPlans = void 0;
const express_1 = __importDefault(require("express"));
const semester_plans_controller_1 = require("./semester-plans.controller");
//using router to forward request
const router = express_1.default.Router();
exports.semesterPlans = router;
//false: only support simple bodys, true would support rich data
router.use(express_1.default.urlencoded({ extended: false }));
//json data will be extracted
router.use(express_1.default.json());
/**
 * @swagger
 * /semester-plans:
 *   post:
 *     tags: [Semester Plans]
 *     summary: Initialize semester plans
 *     description: Creates multiple semester plans for a specific study plan
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *                 description: Study plan ID
 *               semesterPlans:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     semester:
 *                       type: string
 *                       pattern: '\\d{4}((w)|(s))'
 *                       example: '2024w'
 *                     isPastSemester:
 *                       type: boolean
 *                       example: false
 *                     modules:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ['SE1', 'DB1']
 *                     userGeneratedModules:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserGeneratedModule'
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     aimedEcts:
 *                       type: number
 *                       example: 30.0
 *                     summedEcts:
 *                       type: number
 *                       example: 28.0
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
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", semester_plans_controller_1.initSemesterPlans);
/**
 * @swagger
 * semester-plans/plan:
 *   post:
 *     tags: [Semester Plans]
 *     summary: Add semester plan to study plan
 *     description: Creates a new empty semester plan and adds it to the specified study plan
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *                 description: Study plan ID
 *               semester:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2025s'
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/plan", semester_plans_controller_1.addSemesterPlanToStudyPlan);
/**
 * @swagger
 * /semester-plans/plan/aimed-ects:
 *   put:
 *     tags: [Semester Plans::Meta]
 *     summary: Update aimed (target) ECTS
 *     description: Updates the target ECTS credits for a semester plan
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *               semesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
 *               aimedEcts:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 210
 *                 example: 30.0
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/plan/aimed-ects", semester_plans_controller_1.updateSemesterPlanAimedEcts);
/**
 * @swagger
 * /semester-plans/plan/past-semester:
 *   put:
 *     tags: [Semester Plans::Meta]
 *     summary: Update past semester status
 *     description: Updates the isPastSemester property of a semester plan
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *               semesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/plan/past-semester", semester_plans_controller_1.updateIsPastSemester);
/**
 * @swagger
 * /semester-plans/plan/courses:
 *   post:
 *     tags: [Semester Plans::Courses (Stundenplanung)]
 *     summary: Add multiple courses to semester plan
 *     description: Adds multiple courses to the semester plan at once, filtering out duplicates
 *     security:
 *       - bearerAuth: []
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     status:
 *                       type: string
 *                     ects:
 *                       type: number
 *                     sws:
 *                       type: number
 *                     contributeTo:
 *                       type: string
 *                     contributeAs:
 *                       type: string
 *               isPastSemester:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Courses added successfully
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study plan or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/plan/courses", semester_plans_controller_1.addCourses);
/**
 * @swagger
 * /semester-plans/plan/course:
 *   post:
 *     tags: [Semester Plans::Courses (Stundenplanung)]
 *     summary: Add course to semester plan
 *     description: Adds a single course to the semester plan of the user's active study plan
 *     security:
 *       - bearerAuth: []
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
 *                 type: object
 *                 required:
 *                   - id
 *                   - name
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 'C_2024w_001'
 *                   name:
 *                     type: string
 *                     example: 'Software Engineering Praktikum'
 *                   status:
 *                     type: string
 *                     example: 'enrolled'
 *                   ects:
 *                     type: number
 *                     example: 5.0
 *                   sws:
 *                     type: number
 *                     example: 4.0
 *                   contributeTo:
 *                     type: string
 *                     example: 'M_SE1'
 *                   contributeAs:
 *                     type: string
 *                     example: 'Praktikum'
 *               isPastSemester:
 *                 type: boolean
 *                 example: false
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study plan or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/plan/course", semester_plans_controller_1.addCourse);
/**
 * @swagger
 * /semester-plans:
 *   put:
 *     tags: [Semester Plans]
 *     summary: Import semester plan
 *     description: Replaces an existing semester plan with an imported semester plan template
 *     security:
 *       - bearerAuth: []
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
 *                 type: object
 *                 description: Semester plan template to import
 *                 properties:
 *                   isPastSemester:
 *                     type: boolean
 *                     example: false
 *                   courses:
 *                     type: array
 *                     items:
 *                       type: object
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study plan not found or semester mismatch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/", semester_plans_controller_1.importSemesterPlan);
/**
 * @swagger
 * /semester-plans/plan/courses:
 *   delete:
 *     tags: [Semester Plans::Courses (Stundenplanung)]
 *     summary: Delete multiple courses from semester plan
 *     description: Removes multiple courses from a semester plan at once
 *     security:
 *       - bearerAuth: []
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
 *                 example: ['C_2024w_001', 'C_2024w_002']
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study plan or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/plan/courses", semester_plans_controller_1.deleteCourses);
/**
 * @swagger
 * /semester-plans/plan/course:
 *   delete:
 *     tags: [Semester Plans::Courses (Stundenplanung)]
 *     summary: Delete course from semester plan
 *     description: Removes a single course from a semester plan
 *     security:
 *       - bearerAuth: []
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
 *                 example: 'C_2024w_001'
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study plan or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/plan/course", semester_plans_controller_1.deleteCourse);
/**
 * @swagger
 * /semester-plans/plan/module:
 *   post:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Add module to semester (plan)
 *     description: Adds a module (by acronym) to a specific semester (plan)
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *               semesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
 *               module:
 *                 type: string
 *                 example: 'SE1'
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
 *               example: 'SE1'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/plan/module", semester_plans_controller_1.addModule);
/**
 * @swagger
 * /semester-plans/plan/user-generated-module:
 *   post:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Create user-generated module
 *     description: Creates and adds a user-generated (custom) module to a semester plan
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *               semesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/plan/user-generated-module", semester_plans_controller_1.createUserGeneratedModule);
/**
 * @swagger
 * /semester-plans/plan/user-generated-module:
 *   put:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Update user-generated module
 *     description: Updates properties of a user-generated module in a semester plan
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *               semesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
 *               moduleId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439013'
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study plan, semester plan, or module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/plan/user-generated-module", semester_plans_controller_1.updateUserGeneratedModule);
/**
 * @swagger
 * /semester-plans/plan/module:
 *   delete:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Delete module from semester plan
 *     description: Removes a module (by acronym) from a semester plan
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *               semesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
 *               module:
 *                 type: string
 *                 example: 'SE1'
 *                 description: Module acronym to delete
 *               ects:
 *                 type: number
 *                 example: 5.0
 *     responses:
 *       200:
 *         description: Module deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ['SE1']
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Module or semester plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/plan/module", semester_plans_controller_1.deleteModule);
/**
 * @swagger
 * /semester-plans/plan/user-generated-modules:
 *   delete:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Delete multiple user-generated modules
 *     description: Removes multiple user-generated modules from a semester plan at once
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *               semesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
 *               moduleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014']
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Semester plan or modules not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/plan/user-generated-modules", semester_plans_controller_1.deleteUserGeneratedModules);
/**
 * @swagger
 * /semester-plans/plan/user-generated-module:
 *   delete:
 *     tags: [Semester Plans::Modules (Studienplanung)]
 *     summary: Delete user-generated module
 *     description: Removes a user-generated module from a semester plan
 *     security:
 *       - bearerAuth: []
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
 *                 example: '507f1f77bcf86cd799439011'
 *               semesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Semester plan or module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/plan/user-generated-module", semester_plans_controller_1.deleteUserGeneratedModule);
