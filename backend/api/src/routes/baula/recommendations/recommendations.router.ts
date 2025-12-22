import express, { Router } from "express";
import {
    getPersonalRecommendations,
} from "./recommendations.controller";

const router: Router = express.Router();
router.use(express.json());

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
router.get("/", getPersonalRecommendations);

export { router as recommendations };