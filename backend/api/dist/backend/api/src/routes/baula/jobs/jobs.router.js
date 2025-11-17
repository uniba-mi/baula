"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobs = void 0;
const express_1 = __importDefault(require("express"));
const jobs_controller_1 = require("./jobs.controller");
const router = express_1.default.Router();
exports.jobs = router;
/**
 * @swagger
 * /jobs/crawling:
 *   post:
 *     tags: [Jobs]
 *     summary: Crawl job posting from URL
 *     description: Extracts job information (title and description) from a provided job posting URL
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: 'https://www.example-jobs.com/software-engineer-position'
 *                 description: URL of the job posting to crawl
 *     responses:
 *       200:
 *         description: Job information extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Senior Software Engineer'
 *                   description: Job title
 *                 description:
 *                   type: string
 *                   example: 'We are looking for an experienced software engineer...'
 *                   description: Job description
 *                 inputMode:
 *                   type: string
 *                   enum: [url, mock]
 *                   example: 'url'
 *                 keywords:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *                   description: Keywords (empty after crawl, populated after keyword generation)
 *       400:
 *         description: Invalid URL or crawling failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: URL not provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/crawling", jobs_controller_1.crawlJob);
/**
 * @swagger
 * /jobs/keywords:
 *   post:
 *     tags: [Jobs]
 *     summary: Generate keywords from job information
 *     description: Extracts relevant keywords from job title and description using AI/ML processing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: 'Senior Software Engineer'
 *                 description: Job title
 *               description:
 *                 type: string
 *                 example: 'We are looking for an experienced software engineer with expertise in React, Node.js, and cloud technologies...'
 *                 description: Job description
 *     responses:
 *       200:
 *         description: Keywords generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'REST API', 'MongoDB', 'Agile', 'CI/CD', 'Microservices']
 *               description: Array of up to 10 extracted keywords
 *       400:
 *         description: Invalid input or keyword generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: 'Job title or description is missing!'
 *               code: 'BAD_REQUEST'
 */
router.post("/keywords", jobs_controller_1.generateJobKeywords);
/** ---------------------------------------------
 *  ---- Jobinformation to the best Modules --------
 *  @param {String} title - The title related to the keywords
 *  @param {String} description - The description related to the keywords
 *  @param {Array} keywords - List of keywords
 *  @body {Object} - The request body containing module request data
 *  @returns {Object} - JSON list of modules
 *  ---------------------------------------------*/
/**
 * @swagger
 * /jobs/recommendation:
 *   post:
 *     tags: [Jobs]
 *     summary: Get module recommendations for job profile
 *     description: Generates personalized module recommendations based on job requirements. Saves the job profile and updates user's recommendations. Supports both real API calls and mocked recommendations for testing.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job
 *             properties:
 *               jobId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439011'
 *                 description: Optional - Job ID for updating existing job (if omitted, creates new job)
 *               job:
 *                 type: object
 *                 required:
 *                   - title
 *                   - description
 *                   - inputMode
 *                   - keywords
 *                 properties:
 *                   title:
 *                     type: string
 *                     maxLength: 1000
 *                     example: 'Senior Software Engineer'
 *                     description: Job title
 *                   description:
 *                     type: string
 *                     maxLength: 2000
 *                     example: 'We are looking for an experienced software engineer...'
 *                     description: Job description (automatically truncated to 2000 characters)
 *                   inputMode:
 *                     type: string
 *                     enum: [url, mock]
 *                     example: 'url'
 *                     description: 'Input mode: "url" for real recommendations, "mock" for test data'
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker']
 *                     description: Array of job-related keywords
 *     responses:
 *       200:
 *         description: Module recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Job'
 *                 - type: object
 *                   properties:
 *                     recModules:
 *                       type: array
 *                       description: Recommended modules with similarity scores
 *                       items:
 *                         type: object
 *                         properties:
 *                           acronym:
 *                             type: string
 *                             example: 'WEB1'
 *                             description: Module acronym
 *                           score:
 *                             type: number
 *                             format: float
 *                             minimum: 0
 *                             maximum: 1
 *                             example: 0.87
 *                             description: Similarity/relevance score (0-1)
 *       400:
 *         description: Invalid input data or recommendation generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noMhb:
 *                 value:
 *                   message: 'No mhbId or mhbVersion found!'
 *                   code: 'BAD_REQUEST'
 *               invalidJob:
 *                 value:
 *                   message: 'Invalid job input or modules!'
 *                   code: 'BAD_REQUEST'
 *       404:
 *         description: No module recommendations found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: 'Keine Modulempfehlungen gefunden.'
 *               code: 'NOT_FOUND'
 */
router.post("/recommendation", jobs_controller_1.recommendModulesToJob);
