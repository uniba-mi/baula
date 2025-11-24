"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.topics = void 0;
const express_1 = __importDefault(require("express"));
const topics_controller_1 = require("./topics.controller");
const router = express_1.default.Router();
exports.topics = router;
/**
 * @swagger
 * /topics/tree:
 *   get:
 *     tags: [Topics]
 *     summary: Get topic tree
 *     description: Retrieves the complete hierarchical tree structure of all available topics with their parent-child relationships
 *     responses:
 *       200:
 *         description: Topic tree retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topics:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Topic'
 *                       - type: object
 *                         properties:
 *                           children:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Topic'
 *                             description: Child topics (recursive structure)
 *       400:
 *         description: Error retrieving topic tree
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.get("/tree", topics_controller_1.getTopicTree);
/**
 * @swagger
 * /topics/children:
 *   get:
 *     tags: [Topics]
 *     summary: Get child topics
 *     description: Retrieves all topics that have a parent (non-root topics)
 *     responses:
 *       200:
 *         description: Child topics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Error retrieving topics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.get("/children", topics_controller_1.getTopicChildren);
/**
 * @swagger
 * /topics/recommendation:
 *   post:
 *     tags: [Topics]
 *     summary: Generate module recommendations from topics
 *     description: Creates or updates module recommendations based on selected topic IDs using pre-generated embeddings. Supports clearing recommendations by sending an empty array.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tIds
 *             properties:
 *               tIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of topic IDs. Send empty array to clear topic-based recommendations.
 *                 example: ['T10', 'T20']
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recommendation'
 *       400:
 *         description: Invalid topic IDs, no mhbId/mhbVersion found, or recommendation generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: No topics, modules, or embeddings found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post("/recommendation", topics_controller_1.recommendModulesByTopicsPreGenerated);
