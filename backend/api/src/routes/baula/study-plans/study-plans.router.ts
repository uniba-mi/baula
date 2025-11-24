import express, { Router } from "express";
import {
  createStudyPlan,
  updateStudyPlan,
  getAllStudyPlansOfUser,
  deleteStudyPlan,
  getActiveStudyPlan,
  transferModule,
  transferUserGeneratedModule,
  getLatestTemplateForStudyProgram,
  checkStudyPlanTemplateAvailability,
  addModulesToCurrentSemesterOfAllStudyPlans
} from "./study-plans.controller";

const router: Router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

/**
 * @swagger
 * /study-plans:
 *   get:
 *     tags: [Study Plans]
 *     summary: Get all study plans of user
 *     description: Retrieves all study plans belonging to the authenticated user
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
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: No study plans found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get("/", getAllStudyPlansOfUser);

/**
 * @swagger
 * /study-plans/plan/active:
 *   get:
 *     tags: [Study Plans::Plan]
 *     summary: Get active study plan
 *     description: Retrieves the currently active study plan of the authenticated user
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
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: No active study plan found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get("/plan/active", getActiveStudyPlan);

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
 *           example: 'SP1'
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
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Error retrieving template
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Fehler beim Abrufen des Studienplans.'
 */
router.get("/template/:programId/:semesterType", getLatestTemplateForStudyProgram);

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
 *           example: 'SP1'
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
router.get("/template/availablilty/:programId/:semesterType", checkStudyPlanTemplateAvailability);

/**
 * @swagger
 * /study-plans/plan:
 *   post:
 *     tags: [Study Plans::Plan]
 *     summary: Create new study plan
 *     description: Creates a new study plan for the authenticated user
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
 *                     example: 'My studyplan'
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
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Could not create valid study plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post("/plan", createStudyPlan);

/**
 * @swagger
 * /study-plans/modules:
 *   post:
 *     tags: [Study Plans::Modules]
 *     summary: Add modules to all study plans
 *     description: Adds specified modules to the current semester of all existing study plans for the user
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
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.post("/modules", addModulesToCurrentSemesterOfAllStudyPlans);

/**
 * @swagger
 * /study-plans/plan:
 *   put:
 *     tags: [Study Plans::Plan]
 *     summary: Update study plan
 *     description: Updates the name and/or status of a study plan
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
 *                 example: '<MONGO_ID>'
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
 *                     example: 'My updated studyplan'
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
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Study plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/plan", updateStudyPlan);

/**
 * @swagger
 * /study-plans/module/transfer:
 *   put:
 *     tags: [Study Plans::Modules]
 *     summary: Transfer module between semesters
 *     description: Moves a module from one semester plan to another within the same study plan
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
 *                 example: '<MONGO_ID>'
 *                 description: Study plan ID
 *               oldSemesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *                 description: Source semester plan ID
 *               newSemesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *                 description: Destination semester plan ID
 *               acronym:
 *                 type: string
 *                 example: 'MOD-A'
 *                 description: Module acronym to transfer
 *               ects:
 *                 type: number
 *                 example: 5
 *                 description: ECTS credits of the module
 *     responses:
 *       200:
 *         description: Module transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransferResult'
 *       400:
 *         description: Invalid input or transfer failed
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
router.put("/module/transfer", transferModule)

/**
 * @swagger
 * /study-plans/user-generated-module/transfer:
 *   put:
 *     tags: [Study Plans::Modules]
 *     summary: Transfer user-generated module between semesters
 *     description: Moves a user-generated module from one semester plan to another within the same study plan
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
 *                 example: '<MONGO_ID>'
 *                 description: Study plan ID
 *               oldSemesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *                 description: Source semester plan ID
 *               newSemesterPlanId:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *                 description: Destination semester plan ID
 *               module:
 *                 $ref: '#/components/schemas/UserGeneratedModule'
 *     responses:
 *       200:
 *         description: User-generated module transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TransferResult'
 *       400:
 *         description: Invalid input or transfer failed
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
router.put("/user-generated-module/transfer", transferUserGeneratedModule)

/**
 * @swagger
 * /study-plans/plan/{id}:
 *   delete:
 *     tags: [Study Plans::Plan]
 *     summary: Delete study plan
 *     description: Deletes a specific study plan belonging to the authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: '<MONGO_ID>'
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
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Study plan not found or could not be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/plan/:id", deleteStudyPlan);

export { router as studyPlans };
