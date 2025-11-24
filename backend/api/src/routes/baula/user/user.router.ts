import express, { Router } from "express";
import {
  getUser,
  createUser,
  updateUser,
  updateModuleInStudyPath,
  deleteModuleFromStudyPath,
  updateDashboardView,
  updateCompetenceAims,
  deleteStudyPath,
  deleteUser,
  updateHint,
  deleteExcludedModules,
  deleteExcludedModule,
  updateExcludedModule,
  deleteFavouriteModules,
  addConsents,
  updateStudyPath,
  updateTimetableSettings,
  deleteJob,
  finishSemester,
  toggleTopic,
  updateModuleFeedback,
  crawlStudentDataViaFlexNow,
  deleteModuleFeedback,
  updateFavouriteModule,
} from "./user.controller";

const router: Router = express.Router();
router.use(express.json());

/**
 * @swagger
 * /user:
 *   get:
 *     tags: [User]
 *     summary: Get user data via Shibboleth
 *     description: Retrieves the authenticated user's complete profile including study path
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error formatting data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       401:
 *         description: Unauthorized - invalid or missing authentication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
router.get("/", getUser);

/**
 * @swagger
 * /user:
 *   post:
 *     tags: [User]
 *     summary: Create new user
 *     description: Creates a new user account with initial study path data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: object
 *                 required:
 *                   - shibId
 *                   - roles
 *                 properties:
 *                   shibId:
 *                     type: string
 *                     minLength: 32
 *                     maxLength: 32
 *                     description: Shibboleth ID
 *                     example: '<SHIB_ID>'
 *                   roles:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [admin, student, employee, staff, member, faculty, demo, advisor]
 *                     example: ['student']
 *                   authType:
 *                     type: string
 *                     enum: [local, saml]
 *                     example: 'saml'
 *                   startSemester:
 *                     type: string
 *                     pattern: '\\d{4}((w)|(s))'
 *                     example: '2024w'
 *                   duration:
 *                     type: integer
 *                     minimum: 3
 *                     maximum: 20
 *                     example: 6
 *                   maxEcts:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 300
 *                     example: 30
 *                   fulltime:
 *                     type: boolean
 *                     example: true
 *                   sps:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/UserStudyProgramme'
 *                   studyPath:
 *                     type: object
 *                     properties:
 *                       completedModules:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/CompletedModule'
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.post("/", createUser);

/**
 * @swagger
 * /user/competence-aims:
 *   post:
 *     tags: [User::Preferences]
 *     summary: Update competence aims
 *     description: Updates user's competence learning goals/aims
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aims
 *             properties:
 *               aims:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - compId
 *                     - aim
 *                   properties:
 *                     compId:
 *                       type: string
 *                       example: 'C10'
 *                       description: Competence ID
 *                     aim:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 3
 *                       example: 2
 *                       description: Target level for this competence
 *                     standard:
 *                       type: string
 *                       example: 'S1'
 *                       description: Standard/framework
 *                     parent:
 *                       type: string
 *                       example: 'C1'
 *                       description: Parent competence ID
 *     responses:
 *       200:
 *         description: Competence aims updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: 'Die Kompetenzziele wurden erfolgreich aktualisiert.'
 *       400:
 *         description: Invalid or incomplete input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.post("/competence-aims", updateCompetenceAims);

router.post("/fn2student", crawlStudentDataViaFlexNow);

/**
 * @swagger
 * /user:
 *   put:
 *     tags: [User]
 *     summary: Update user profile
 *     description: Updates user profile information including preferences, settings, and study programme data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 allOf:
 *                   - $ref: '#/components/schemas/User'
 *                   - type: object
 *                     required:
 *                       - _id
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/", updateUser);

// for updating via acronym (potentially across several semesters) use this
/**
 * @swagger
 * /user/study-path:
 *   put:
 *     tags: [User::Study Path]
 *     summary: Update multiple modules in study path
 *     description: Updates several modules at once in the user's study path. Matches modules by acronym and semester, or by _id for user-generated modules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - completedModules
 *             properties:
 *               completedModules:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CompletedModule'
 *     responses:
 *       200:
 *         description: Study path updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedModules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CompletedModule'
 *                 completedCourses:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid parameters or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/study-path", updateStudyPath);

// for semester transition
/**
 * @swagger
 * /user/study-path/semester:
 *   put:
 *     tags: [User::Study Path]
 *     summary: Finish semester and transition modules
 *     description: Completes a semester by moving planned modules to completed modules except for modules excluded by the user (droppedModules), and preventing duplicates of already passed modules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - completedModules
 *               - droppedModules
 *             properties:
 *               completedModules:
 *                 type: array
 *                 description: Modules completed this semester
 *                 items:
 *                   $ref: '#/components/schemas/CompletedModule'
 *               droppedModules:
 *                 type: array
 *                 description: Modules to remove from study path
 *                 items:
 *                   $ref: '#/components/schemas/CompletedModule'
 *     responses:
 *       200:
 *         description: Semester finished successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedModules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CompletedModule'
 *                 completedCourses:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/study-path/semester", finishSemester);

// for editing a specific PathModule in the STUDYPATH by _id not acronym use this
/**
 * @swagger
 * /user/study-path/module:
 *   put:
 *     tags: [User::Study Path]
 *     summary: Update or add a single module in study path
 *     description: Updates a specific module in the study path by _id, or adds it if it doesn't exist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - acronym
 *               - name
 *               - status
 *               - ects
 *               - semester
 *               - mgId
 *               - isUserGenerated
 *               - flexNowImported
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Module ID (required for updates)
 *                 example: '<MONGO_ID>'
 *               acronym:
 *                 type: string
 *                 example: 'MOD-A'
 *               name:
 *                 type: string
 *                 example: 'Applied X'
 *               status:
 *                 type: string
 *                 enum: [taken, failed, passed, open]
 *                 example: 'passed'
 *               ects:
 *                 type: number
 *                 example: 5
 *               grade:
 *                 type: number
 *                 minimum: 1.0
 *                 maximum: 5.0
 *                 example: 1.7
 *               semester:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2024w'
 *               mgId:
 *                 type: string
 *                 example: 'MG1'
 *               isUserGenerated:
 *                 type: boolean
 *                 example: false
 *               flexNowImported:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Module updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedModules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CompletedModule'
 *                 completedCourses:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid input or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found or parameters missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/study-path/module", updateModuleInStudyPath);

/**
 * @swagger
 * /user/dashboard-settings:
 *   put:
 *     tags: [User::Settings]
 *     summary: Toggle dashboard widget visibility
 *     description: Toggles the visibility of a specific dashboard chart/widget
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *                $ref: '#/components/schemas/DashboardSetting'
 *     responses:
 *       200:
 *         description: Dashboard settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   key:
 *                     type: string
 *                   visible:
 *                     type: boolean
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User or chart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/dashboard-settings", updateDashboardView);

/**
 * @swagger
 * /user/timetable-settings:
 *   put:
 *     tags: [User::Settings]
 *     summary: Update timetable settings
 *     description: Updates user's timetable display settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - showWeekends
 *             properties:
 *               showWeekends:
 *                 type: boolean
 *                 description: Whether to display weekends in timetable
 *                 example: false
 *     responses:
 *       200:
 *         description: Timetable settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   showWeekends:
 *                     type: boolean
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/timetable-settings", updateTimetableSettings);

/**
 * @swagger
 * /user/favourite-module:
 *   put:
 *     tags: [User::Preferences]
 *     summary: Toggle favorite module
 *     description: Adds or removes a module from user's favourites list
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - acronym
 *             properties:
 *               acronym:
 *                 type: string
 *                 example: 'MOD-A'
 *                 description: Module acronym to add/remove from favourites
 *     responses:
 *       200:
 *         description: Favourites updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ['MOD-A', 'MOD-B']
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/favourite-module", updateFavouriteModule);

/**
 * @swagger
 * /user/excluded-module:
 *   put:
 *     tags: [User::Preferences]
 *     summary: Toggle excluded module
 *     description: Adds or removes a module from user's excluded list
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - acronym
 *             properties:
 *               acronym:
 *                 type: string
 *                 example: 'MOD-A'
 *                 description: Module acronym to add/remove from excluded list
 *     responses:
 *       200:
 *         description: Excluded list updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ['MOD-A', 'MOD-B']
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/excluded-module", updateExcludedModule);

/**
 * @swagger
 * /user/topic:
 *   put:
 *     tags: [User::Preferences]
 *     summary: Toggle user topic
 *     description: Adds or removes a topic from user's selected topics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *                 example: 'T10'
 *                 description: Topic ID to add/remove
 *     responses:
 *       200:
 *         description: Topics updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topics:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ['T10', 'T20']
 *       400:
 *         description: Invalid input or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.put("/topic", toggleTopic)

/**
 * @swagger
 * /user/hints:
 *   put:
 *     tags: [User::Settings]
 *     summary: Update UI hint status
 *     description: Marks a UI hint/tip as confirmed by the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *                $ref: '#/components/schemas/Hint'
 *     responses:
 *       200:
 *         description: Hint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   key:
 *                     type: string
 *                   hasConfirmed:
 *                     type: boolean
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User or hint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/hints", updateHint);

/**
 * @swagger
 * /user/consents:
 *   post:
 *     tags: [User::Settings]
 *     summary: Add user consent entry
 *     description: Records a new user consent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *                $ref: '#/components/schemas/Consent'
 *     responses:
 *       200:
 *         description: Consent added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ctype:
 *                     type: string
 *                   hasConfirmed:
 *                     type: boolean
 *                   hasResponded:
 *                     type: boolean
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid input or unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post("/consents", addConsents);

/**
 * @swagger
 * /user/module-feedback:
 *   put:
 *     tags: [User::Preferences]
 *     summary: Update module feedback
 *     description: Adds or updates user feedback for a specific module (ratings for similarity, prior knowledge, content match)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *             properties:
 *               feedback:
 *                  $ref: '#/components/schemas/ModuleFeedback'
 *     responses:
 *       200:
 *         description: Module feedback updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/ModuleFeedback'
 *       400:
 *         description: Invalid input or unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/module-feedback", updateModuleFeedback);

/**
 * @swagger
 * /user/study-path:
 *   delete:
 *     tags: [User::Study Path]
 *     summary: Delete entire study path
 *     description: Removes all completed modules from the user's study path
 *     responses:
 *       200:
 *         description: Study path deleted successfully
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
 *         description: Error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/study-path", deleteStudyPath);

/**
 * @swagger
 * /user/favourite-modules:
 *   delete:
 *     tags: [User::Preferences]
 *     summary: Clear all favorite modules
 *     description: Removes all modules from user's favourites list
 *     responses:
 *       200:
 *         description: All favourites cleared successfully
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
 *         description: Error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/favourite-modules", deleteFavouriteModules);

/**
 * @swagger
 * /user/excluded-modules:
 *   delete:
 *     tags: [User::Preferences]
 *     summary: Clear all excluded modules
 *     description: Removes all modules from user's excluded list
 *     responses:
 *       200:
 *         description: Excluded list cleared successfully
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
 *         description: Error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/excluded-modules", deleteExcludedModules);

/**
 * @swagger
 * /user/excluded-module/{acronym}:
 *   delete:
 *     tags: [User::Preferences]
 *     summary: Remove specific excluded module
 *     description: Removes a specific module from user's excluded list
 *     parameters:
 *       - in: path
 *         name: acronym
 *         required: true
 *         schema:
 *           type: string
 *           example: 'MOD-A'
 *         description: Module acronym to remove
 *     responses:
 *       200:
 *         description: Module removed successfully
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
 *         description: Invalid input or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.delete("/excluded-module/:acronym", deleteExcludedModule);

/**
 * @swagger
 * /user/study-path/module:
 *   delete:
 *     tags: [User::Study Path]
 *     summary: Delete module from study path
 *     description: Removes a specific module from the user's study path
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - semester
 *             properties:
 *               id:
 *                 type: string
 *                 description: Module _id
 *                 example: '<MONGO_ID>'
 *               semester:
 *                 type: string
 *                 pattern: '\\d{4}((w)|(s))'
 *                 example: '2024w'
 *     responses:
 *       200:
 *         description: Module deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedModules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CompletedModule'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Semester or module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/study-path/module", deleteModuleFromStudyPath);

/**
 * @swagger
 * /user/module-feedback:
 *   delete:
 *     tags: [User::Preferences]
 *     summary: Delete module feedback
 *     description: Removes all feedback for a specific module
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *             properties:
 *               feedback:
 *                 type: object
 *                 required:
 *                   - acronym
 *                 properties:
 *                   acronym:
 *                     type: string
 *                     example: 'MOD-A'
 *                     description: Module acronym to remove feedback for
 *     responses:
 *       200:
 *         description: Module feedback deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid input or unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/module-feedback", deleteModuleFeedback)

/**
 * @swagger
 * /user/job:
 *   delete:
 *     tags: [User::Preferences]
 *     summary: Delete job profile
 *     description: Deletes a job profile and removes its associated module recommendations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 example: '<MONGO_ID>'
 *                 description: Job ID to delete
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: 'Job deleted successfully.'
 *       400:
 *         description: Error occurred during deletion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: No valid job ID found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/job", deleteJob)

/**
 * @swagger
 * /user:
 *   delete:
 *     tags: [User]
 *     summary: Delete user account
 *     description: Permanently deletes the user account and all associated data including study plans, semester plans, and recommendations
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Der Nutzer wurde gelöscht!'
 *       400:
 *         description: Unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete("/", deleteUser)

export { router as user };
