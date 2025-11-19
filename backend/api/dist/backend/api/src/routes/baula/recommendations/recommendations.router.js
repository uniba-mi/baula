"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendations = void 0;
const express_1 = __importDefault(require("express"));
const recommendations_controller_1 = require("./recommendations.controller");
const router = express_1.default.Router();
exports.recommendations = router;
router.use(express_1.default.json());
/**
 * @swagger
 * /recommendations:
 *   get:
 *     tags: [Recommendations]
 *     summary: Get personal module recommendations
 *     description: Retrieves personalized module recommendations for the authenticated user based on topics, jobs, and other factors
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recommendation'
 *       400:
 *         description: Error retrieving recommendations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *             example:
 *               message: 'Fehler beim Abruf der Empfehlung'
 *               code: 'BAD_REQUEST'
 */
router.get("/", recommendations_controller_1.getPersonalRecommendations);
