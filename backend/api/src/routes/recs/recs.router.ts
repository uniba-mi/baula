import express, { Router } from "express";
import {
    getPersonalRecommendations,
    getTopicChildren,
    getTopicTree,
    recommendModulesByTopicsPreGenerated,
    updatePersonalRecommendationsByFeedback,
    deletePersonalRecommendationsByFeedback,
} from "./recs.controller";

const router: Router = express.Router();
router.use(express.json());

/** --------------------------------------------
 *  ---- returns tree of topics from db ----
 *  @returns array of topics
 *  -------------------------------------------- */
router.get("/topic/tree", getTopicTree);

/** --------------------------------------------
 *  ---- returns children topics from db ----
 *  @returns array of children topics
 *  -------------------------------------------- */
router.get("/topic/children", getTopicChildren);

/** ------------------------------------
 *  Creates a list of module recommendations from topic ids with pre-generated embeddings
 *  @param tIds contains an array of topicids
 *  @returns a recommendation
 *  ------------------------------------ */
router.post("/topic/recommendation", recommendModulesByTopicsPreGenerated);

/** ------------------------------------
 *  Gets a list of module recommendations for the user (topics, jobs, ...)
 *  @returns a recommendation for the user
 *  ------------------------------------ */
router.get("/personal", getPersonalRecommendations);

/** ------------------------------------
 *  Updates personal recommendations based on user feedback
 *  @returns updated recommendation for the user
 *  ------------------------------------ */
router.put("/personal", updatePersonalRecommendationsByFeedback);

/** ------------------------------------
 *  Deletes feedback for given acronym from personal recommendations
 *  @returns updated recommendation for the user
 *  ------------------------------------ */
router.delete('/personal/feedback/:acronym', deletePersonalRecommendationsByFeedback);

export { router as recs };
