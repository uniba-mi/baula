"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recs = void 0;
const express_1 = __importDefault(require("express"));
const recs_controller_1 = require("./recs.controller");
const router = express_1.default.Router();
exports.recs = router;
router.use(express_1.default.json());
/** --------------------------------------------
 *  ---- returns tree of topics from db ----
 *  @returns array of topics
 *  -------------------------------------------- */
router.get("/topic/tree", recs_controller_1.getTopicTree);
/** --------------------------------------------
 *  ---- returns children topics from db ----
 *  @returns array of children topics
 *  -------------------------------------------- */
router.get("/topic/children", recs_controller_1.getTopicChildren);
/** ------------------------------------
 *  Creates a list of module recommendations from topic ids with pre-generated embeddings
 *  @param tIds contains an array of topicids
 *  @returns a recommendation
 *  ------------------------------------ */
router.post("/topic/recommendation", recs_controller_1.recommendModulesByTopicsPreGenerated);
/** ------------------------------------
 *  Gets a list of module recommendations for the user (topics, jobs, ...)
 *  @returns a recommendation for the user
 *  ------------------------------------ */
router.get("/personal", recs_controller_1.getPersonalRecommendations);
/** ------------------------------------
 *  Updates personal recommendations based on user feedback
 *  @returns updated recommendation for the user
 *  ------------------------------------ */
router.put("/personal", recs_controller_1.updatePersonalRecommendationsByFeedback);
/** ------------------------------------
 *  Deletes feedback for given acronym from personal recommendations
 *  @returns updated recommendation for the user
 *  ------------------------------------ */
router.delete('/personal/feedback/:acronym', recs_controller_1.deletePersonalRecommendationsByFeedback);
