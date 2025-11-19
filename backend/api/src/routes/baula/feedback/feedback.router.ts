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
 *                 type: object
 *                 required:
 *                   - acronym
 *                   - similarmods
 *                   - contentmatch
 *                 properties:
 *                   acronym:
 *                     type: string
 *                     example: 'MI-WebT-B'
 *                     description: Module acronym being rated
 *                   similarmods:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 5
 *                     example: 4
 *                     description: Rating for recommending similar modules (0-5)
 *                   similarchair:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 5
 *                     example: 3
 *                     description: Rating for recommending modules of similar chair (0-5)
 *                   priorknowledge:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 5
 *                     example: 5
 *                     description: Rating for prerequisites (0-5)
 *                   contentmatch:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 5
 *                     example: 4
 *                     description: Rating for content matching the teaching contents (0-5, triggers recommendation if ≥3)
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
 *                   _id: '507f1f77bcf86cd799439015'
 *                   userId: '507f1f77bcf86cd799439011'
 *                   recommendedMods:
 *                     - acronym: 'SE2'
 *                       source:
 *                         - type: 'feedback_similarmods'
 *                           identifier: 'SE1'
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
 *           example: 'MI-WebT-B'
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
 *                   _id: '1234'
 *                   userId: '1234'
 *                   recommendedMods:
 *                     - acronym: 'MI-WebT-B'
 *                       source:
 *                         - type: 'job'
 *                           identifier: '1234'
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
