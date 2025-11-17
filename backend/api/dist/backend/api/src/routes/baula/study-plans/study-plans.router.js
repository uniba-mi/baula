"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studyPlans = void 0;
const express_1 = __importDefault(require("express"));
const study_plans_controller_1 = require("./study-plans.controller");
const router = express_1.default.Router();
exports.studyPlans = router;
router.use(express_1.default.urlencoded({ extended: false }));
router.use(express_1.default.json());
/**
 * @swagger
 * /study-plans:
 *   get:
 *     tags: [Study Plans]
 *     summary: Get all study plans of user
 *     description: Retrieves all study plans belonging to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Study plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudyPlan'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No study plans found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", study_plans_controller_1.getAllStudyPlansOfUser);
/**
 * @swagger
 * /study-plans/plan/active:
 *   get:
 *     tags: [Study Plans::Plan]
 *     summary: Get active study plan
 *     description: Retrieves the currently active study plan of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active study plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudyPlan'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No active study plan found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/plan/active", study_plans_controller_1.getActiveStudyPlan);
/**
 * @swagger
 * /study-plans/template/{programId}/{semesterType}:
 *   get:
 *     tags: [Study Plans::Template]
 *     summary: Get latest study plan template
 *     description: Retrieves the latest study plan template for a specific degree programme and semester type
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *           example: 'BAAng'
 *         description: Program ID (e.g., BAAng for Bachelor Applied Computer Science)
 *       - in: path
 *         name: semesterType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [w, s]
 *           example: 'w'
 *         description: Semester type (w for winter, s for summer)
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudyPlan'
 *       404:
 *         description: Template not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Musterstudienverlaufsplan nicht gefunden.'
 *       500:
 *         description: Error retrieving template
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Fehler beim Abrufen des Studienplans.'
 */
router.get("/template/:programId/:semesterType", study_plans_controller_1.getLatestTemplateForStudyProgram);
/**
 * @swagger
 * /study-plans/template/availablilty/{programId}/{semesterType}:
 *   get:
 *     tags: [Study Plans::Template]
 *     summary: Check study plan template availability
 *     description: Checks if a study plan template exists for the specified degree programme and semester type
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *           example: 'BAAng'
 *         description: Program ID
 *       - in: path
 *         name: semesterType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [w, s]
 *           example: 'w'
 *         description: Semester type (w for winter, s for summer)
 *     responses:
 *       200:
 *         description: Availability check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   description: Whether a template is available
 *                   example: true
 */
router.get("/template/availablilty/:programId/:semesterType", study_plans_controller_1.checkStudyPlanTemplateAvailability);
/**
 * @swagger
 * /study-plans/plan:
 *   post:
 *     tags: [Study Plans::Plan]
 *     summary: Create new study plan
 *     description: Creates a new study plan for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyPlan
 *             properties:
 *               studyPlan:
 *                 type: object
 *                 required:
 *                   - name
 *                   - status
 *                   - semesterPlans
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: 'Mein Studienplan WS 2024'
 *                     description: Name of the study plan
 *                   status:
 *                     type: boolean
 *                     example: true
 *                     description: Active status of the study plan
 *                   semesterPlans:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/SemesterPlan'
 *                     description: Array of semester plans
 *     responses:
 *       200:
 *         description: Study plan created successfully
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
 *         description: Could not create valid study plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/plan", study_plans_controller_1.createStudyPlan);
/**
 * @swagger
 * /study-plans/modules:
 *   post:
 *     tags: [Study Plans::Modules]
 *     summary: Add modules to all study plans
 *     description: Adds specified modules to the current semester of all existing study plans for the user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modules
 *               - semesterName
 *             properties:
 *               modules:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/UserGeneratedModule'
 *                 description: Array of modules to add
 *               semesterName:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2024w'
 *                 description: Semester identifier where modules should be added
 *     responses:
 *       200:
 *         description: Modules added successfully to all study plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudyPlan'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/modules", study_plans_controller_1.addModulesToCurrentSemesterOfAllStudyPlans);
/**
 * @swagger
 * /study-plans/plan:
 *   put:
 *     tags: [Study Plans::Plan]
 *     summary: Update study plan
 *     description: Updates the name and/or status of a study plan
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
 *               - study plan
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439011'
 *                 description: ID of the study plan to update
 *               study plan:
 *                 type: object
 *                 required:
 *                   - name
 *                   - status
 *                   - semesterPlans
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: 'Mein aktualisierter Studienplan'
 *                   status:
 *                     type: boolean
 *                     example: true
 *                   semesterPlans:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/SemesterPlan'
 *     responses:
 *       200:
 *         description: Study plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 acknowledged:
 *                   type: boolean
 *                 modifiedCount:
 *                   type: integer
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
router.put("/plan", study_plans_controller_1.updateStudyPlan);
/**
 * @swagger
 * /study-plans/module/transfer:
 *   put:
 *     tags: [Study Plans::Modules]
 *     summary: Transfer module between semesters
 *     description: Moves a module from one semester plan to another within the same study plan
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
 *               - oldSemesterPlanId
 *               - newSemesterPlanId
 *               - acronym
 *               - ects
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439011'
 *                 description: Study plan ID
 *               oldSemesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
 *                 description: Source semester plan ID
 *               newSemesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439013'
 *                 description: Destination semester plan ID
 *               acronym:
 *                 type: string
 *                 example: 'SE1'
 *                 description: Module acronym to transfer
 *               ects:
 *                 type: number
 *                 example: 5.0
 *                 description: ECTS credits of the module
 *     responses:
 *       200:
 *         description: Module transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oldSemesterPlan:
 *                   $ref: '#/components/schemas/SemesterPlan'
 *                 newSemesterPlan:
 *                   $ref: '#/components/schemas/SemesterPlan'
 *       400:
 *         description: Invalid input or transfer failed
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
router.put("/module/transfer", study_plans_controller_1.transferModule);
/**
 * @swagger
 * /study-plans/user-generated-module/transfer:
 *   put:
 *     tags: [Study Plans::Modules]
 *     summary: Transfer user-generated module between semesters
 *     description: Moves a user-generated module from one semester plan to another within the same study plan
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
 *               - oldSemesterPlanId
 *               - newSemesterPlanId
 *               - module
 *             properties:
 *               studyPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439011'
 *                 description: Study plan ID
 *               oldSemesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439012'
 *                 description: Source semester plan ID
 *               newSemesterPlanId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439013'
 *                 description: Destination semester plan ID
 *               module:
 *                 $ref: '#/components/schemas/UserGeneratedModule'
 *     responses:
 *       200:
 *         description: User-generated module transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oldSemesterPlan:
 *                   $ref: '#/components/schemas/SemesterPlan'
 *                 newSemesterPlan:
 *                   $ref: '#/components/schemas/SemesterPlan'
 *       400:
 *         description: Invalid input or transfer failed
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
router.put("/user-generated-module/transfer", study_plans_controller_1.transferUserGeneratedModule);
/**
 * @swagger
 * /study-plans/plan/{id}:
 *   delete:
 *     tags: [Study Plans::Plan]
 *     summary: Delete study plan
 *     description: Deletes a specific study plan belonging to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: '507f1f77bcf86cd799439011'
 *         description: Study plan ID to delete
 *     responses:
 *       200:
 *         description: Study plan deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 acknowledged:
 *                   type: boolean
 *                 deletedCount:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study plan not found or could not be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/plan/:id", study_plans_controller_1.deleteStudyPlan);
