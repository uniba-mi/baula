import express, { Router } from "express";
import { deletePersonalRecommendationsByFeedback, updatePersonalRecommendationsByFeedback } from "./feedback.controller";

const router: Router = express.Router();
router.use(express.json());

/**
 * @swagger
 * /feedback:
 *   put:
 *     tags: [Feedback]
 *     summary: Update recommendations based on module feedback
 *     description: |
 *       Updates personal module recommendations based on user feedback about a completed module. 
 *       Uses similarity analysis to find related modules when content match rating is ≥ 3.
 *       If content match < 3, removes existing feedback-based recommendations for that module.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moduleFeedback
 *             properties:
 *               moduleFeedback:
 *                 $ref: '#/components/schemas/ModuleFeedback'
 *     responses:
 *       200:
 *         description: Recommendations updated successfully based on feedback
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Recommendation'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 'No embedding found for feedback module'
 *                     recommendations:
 *                       type: object
 *                       properties:
 *                         recommendedMods:
 *                           type: array
 *                           items: {}
 *             examples:
 *               updated:
 *                 summary: Recommendations updated
 *                 value:
 *                   _id: '<MONGO_ID>'
 *                   userId: '<MONGO_ID>'
 *                   recommendedMods:
 *                     - acronym: 'MOD-B'
 *                       source:
 *                         - type: 'feedback_similarmods'
 *                           identifier: '<MONGO_ID>'
 *                           score: 0.89
 *                       frequency: 1
 *                       score: 0.89
 *               noEmbedding:
 *                 summary: No embedding found
 *                 value:
 *                   message: 'No embedding found for feedback module'
 *               lowRating:
 *                 summary: Content match below threshold
 *                 value:
 *                   message: 'No existing recommendations to update'
 *               noSimilar:
 *                 summary: No similar modules found
 *                 value:
 *                   message: 'No similar modules found above threshold'
 *                   recommendations:
 *                     recommendedMods: []
 *       400:
 *         description: Invalid input or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Required data not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put("/", updatePersonalRecommendationsByFeedback);

/**
 * @swagger
 * /feedback/{acronym}:
 *   delete:
 *     tags: [Feedback]
 *     summary: Delete feedback-based recommendations
 *     description: |
 *       Removes all feedback-based recommendation sources associated with a specific module.
 *       This cleans up recommendations that were generated based on user feedback about the specified module.
 *       Modules with no remaining sources are automatically removed from recommendations.
 *     parameters:
 *       - in: path
 *         name: acronym
 *         required: true
 *         schema:
 *           type: string
 *           example: 'MOD-A'
 *         description: Module acronym to remove feedback recommendations for
 *     responses:
 *       200:
 *         description: Feedback recommendations deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Recommendation'
 *                 - type: object
 *                   properties:
 *                     recommendedMods:
 *                       type: array
 *                       items: {}
 *                       example: []
 *             examples:
 *               deleted:
 *                 summary: Feedback removed
 *                 value:
 *                   _id: '<MONGO_ID>'
 *                   userId: '<MONGO_ID>'
 *                   recommendedMods:
 *                     - acronym: 'MOD-A'
 *                       source:
 *                         - type: 'job'
 *                           identifier: '<MONGO_ID>'
 *                           score: 0.85
 *                       frequency: 1
 *                       score: 0.85
 *               noRecommendations:
 *                 summary: No recommendations found
 *                 value:
 *                   recommendedMods: []
 *       400:
 *         description: Invalid input or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 */
router.delete('/:acronym', deletePersonalRecommendationsByFeedback);

export { router as feedback };
