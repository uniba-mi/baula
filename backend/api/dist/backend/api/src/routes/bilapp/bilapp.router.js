"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bilapp = void 0;
const express_1 = __importDefault(require("express"));
const bilapp_controller_1 = require("./bilapp.controller");
const authentication_middleware_1 = require("../../shared/middleware/authentication-middleware");
const router = express_1.default.Router();
exports.bilapp = router;
// get all standards
router.get("/standards", bilapp_controller_1.getAllStandards);
// get one standard
router.get("/standard/:id", bilapp_controller_1.getSingleStandard);
// get all competences
router.get("/competences/all", bilapp_controller_1.getAllCompetences);
// get all competences of a certain standard
router.get("/competences/all/:id", bilapp_controller_1.getCompetencesFromStandard);
// get competences with specific standardId that has no parents -> uppest competenceGroups
router.get("/competences/uppest/:id", bilapp_controller_1.getUppestCompetenceGroups);
// get all comptences that has no parent -> all uppest competenceGroups
router.get("/competences/uppest", bilapp_controller_1.getAllUppestCompetenceGroups);
// get all competences that has a competenceGroupID --> all competence on the second level AND below
router.get("/competences/children/uppest", bilapp_controller_1.getAllLowerCompetences);
// get all competences that belong to a certain competenceGroupID
router.get("/competences/children/uppest/:id", bilapp_controller_1.getLowerCompetences);
// Routes for courses
/**
 * @swagger
 * /course/{id}:
 *   get:
 *     tags: [BilApp]
 *     summary: Get course competences and modules
 *     description: Retrieves detailed information about a BilApp course including its associated competences and modules
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2
 *           maximum: 500
 *           example: 42
 *         description: BilApp course ID
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 42
 *                   description: Course ID
 *                 name:
 *                   type: string
 *                   example: 'Software Engineering Vorlesung'
 *                   description: Course name
 *                 semester:
 *                   type: string
 *                   example: 'WS_2024_25'
 *                   description: Semester identifier
 *                 modules:
 *                   type: array
 *                   description: Associated modules
 *                   items:
 *                     type: object
 *                     properties:
 *                       modId:
 *                         type: string
 *                         example: 'M_SE1'
 *                         description: Module ID
 *                 comp:
 *                   type: array
 *                   description: Associated competences with fulfillment levels
 *                   items:
 *                     type: object
 *                     properties:
 *                       compId:
 *                         type: string
 *                         example: 'COMP_001'
 *                         description: Competence ID
 *                       fulfillment:
 *                         type: integer
 *                         minimum: 0
 *                         maximum: 3
 *                         example: 2
 *                         description: Fulfillment level (0=not covered, 1=introduced, 2=reinforced, 3=mastered)
 *       400:
 *         description: Invalid course ID or error retrieving data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: 'Die übergebenen Daten sind nicht valide.'
 *               code: 'BAD_REQUEST'
 */
router.get("/course/:id", bilapp_controller_1.getCompetenceAndModulesOfCourse);
/**
 * @swagger
 * /courses:
 *   get:
 *     tags: [BilApp]
 *     summary: Get all saved courses from all semester plans
 *     description: Retrieves all courses from all semester plans of the user's active study plan with full details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Course'
 *                   - type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         example: 'enrolled'
 *                       contributeTo:
 *                         type: string
 *                         example: 'M_SE1'
 *                       contributeAs:
 *                         type: string
 *                         example: 'Praktikum'
 *       404:
 *         description: No study plan found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/courses/", authentication_middleware_1.ensureAuthenticated, bilapp_controller_1.getAllSavedCourses);
/**
 * @swagger
 * /courses/{semester}:
 *   get:
 *     tags: [BilApp]
 *     summary: Get BilApp courses by semester
 *     description: Retrieves all courses from the BilApp system for a specific semester
 *     parameters:
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '(WS_\\d{4}_\\d{2})|(SoSe_\\d{4})'
 *           example: 'WS_2024_25'
 *         description: Semester identifier in format WS_YYYY_YY (winter) or SoSe_YYYY (summer)
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                     description: BilApp course ID
 *                   name:
 *                     type: string
 *                     example: 'Software Engineering Vorlesung'
 *                     description: Course name
 *       400:
 *         description: Invalid semester format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: 'Die übergebenen Daten sind nicht valide.'
 *               code: 'BAD_REQUEST'
 */
router.get("/courses/:semester", bilapp_controller_1.getBilAppCourses);
/**
 * @swagger
 * /courses/{semester}/{searchTerm}:
 *   get:
 *     summary: Get courses with a specific search term (e.g. LAMOD-01 for all EWS-Courses)
 *     tags: [BilApp]
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
router.get("/courses/:semester/:searchTerm", authentication_middleware_1.ensureAuthenticated, bilapp_controller_1.getSpecificCourses);
/**
 * @swagger
 * /courses/{semester}/{competence}/{topN}:
 *   get:
 *     summary: Get top n courses of those who fulfill given competence group the most for given semester
 *     tags: [BilApp]
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
router.get("/courses/:semester/:competence/:topN", authentication_middleware_1.ensureAuthenticated, bilapp_controller_1.getTopNCoursesForCompetence);
/**
 * @swagger
 * /modules:
 *   get:
 *     tags: [BilApp]
 *     summary: Get unique modules
 *     description: Retrieves a list of unique modules (distinct by acronym), filtered to modules starting with 'LAMOD'
 *     responses:
 *       200:
 *         description: Modules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   acronym:
 *                     type: string
 *                     example: 'LAMOD_SE1'
 *                     description: Module acronym
 *                   name:
 *                     type: string
 *                     example: 'Software Engineering 1'
 *                     description: Module name
 *       404:
 *         description: No modules found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: 'Keine Module gefunden!'
 *               code: 'NOT_FOUND'
 */
router.get("/modules", bilapp_controller_1.getUniqueModules);
