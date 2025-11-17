"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedback = void 0;
const express_1 = __importDefault(require("express"));
const feedback_controller_1 = require("./feedback.controller");
const router = express_1.default.Router();
exports.feedback = router;
router.use(express_1.default.json());
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
 *
 *       The feedback includes ratings for:
 *       - Similar modules (similarmods): How similar was this module to others?
 *       - Similar chair (similarchair): How similar was the teaching style/department?
 *       - Prior knowledge (priorknowledge): How well did prerequisites prepare you?
 *       - Content match (contentmatch): How well did content match expectations?
 *     security:
 *       - bearerAuth: []
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
 *                     example: 'SE1'
 *                     description: Module acronym being rated
 *                   similarmods:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 5
 *                     example: 4
 *                     description: Rating for similarity to other modules (0-5)
 *                   similarchair:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 5
 *                     example: 3
 *                     description: Rating for similar teaching style/department (0-5)
 *                   priorknowledge:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 5
 *                     example: 5
 *                     description: Rating for prerequisite preparation (0-5)
 *                   contentmatch:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 5
 *                     example: 4
 *                     description: Rating for content matching expectations (0-5, triggers recommendation if ≥3)
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
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               notAuthenticated:
 *                 value:
 *                   message: 'User not authenticated'
 *                   code: 'BAD_REQUEST'
 *               noMhb:
 *                 value:
 *                   message: 'No valid mhbId or mhbVersion found'
 *                   code: 'BAD_REQUEST'
 *               updateFailed:
 *                 value:
 *                   message: 'Failed to update recommendations based on feedback'
 *                   code: 'BAD_REQUEST'
 *       404:
 *         description: Required data not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noModules:
 *                 value:
 *                   message: 'No modules found for the given MHB information'
 *                   code: 'NOT_FOUND'
 *               noEmbeddings:
 *                 value:
 *                   message: 'No embeddings found for available modules'
 *                   code: 'NOT_FOUND'
 */
router.put("/", feedback_controller_1.updatePersonalRecommendationsByFeedback);
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: acronym
 *         required: true
 *         schema:
 *           type: string
 *           example: 'SE1'
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
 *                   _id: '507f1f77bcf86cd799439015'
 *                   userId: '507f1f77bcf86cd799439011'
 *                   recommendedMods:
 *                     - acronym: 'SE2'
 *                       source:
 *                         - type: 'job'
 *                           identifier: '507f1f77bcf86cd799439012'
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
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               notAuthenticated:
 *                 value:
 *                   message: 'User not authenticated'
 *                   code: 'BAD_REQUEST'
 *               invalidAcronym:
 *                 value:
 *                   message: 'Invalid module acronym'
 *                   code: 'BAD_REQUEST'
 *               deletionFailed:
 *                 value:
 *                   message: 'Failed to delete feedback recommendations'
 *                   code: 'BAD_REQUEST'
 */
router.delete('/:acronym', feedback_controller_1.deletePersonalRecommendationsByFeedback);
