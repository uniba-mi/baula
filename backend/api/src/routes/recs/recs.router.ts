import express, { Router } from "express";
import {
    getAvgRecSemester,
    getBottomNCommonPasses,
    getCommonlyPassedModules,
    getPersonalRecommendations,
    // getCorrelating,
    // getKeyDriverModules,
    getPrecursors,
    getCohortRecsAvailableInfo,
    getSuccessors,
    getSucRecSemester,
    getTopicChildren,
    getTopicTree,
    getTopNCommonPasses,
    getTopNSuccessors,
    recommendModulesByTopicsPreGenerated,
} from "./recs.controller";

const router: Router = express.Router();
router.use(express.json());

/** -----------------------------------------------------------
 *  ---- returns the information if recs are available for spId --
 *  @param spId contains the spId of the user
 *  @returns yes or no as boolean
 *  -------------------------------------------- */
router.get("/:spId/cohort-recs-available", getCohortRecsAvailableInfo);

/** --------------------------------------------
 *  ---- returns the average pass semester of a module ----
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @returns average recommended semester number/range..
 *  -------------------------------------------- */
router.get("/:spId/:modAcr/semester/avg", getAvgRecSemester);

/** --------------------------------------------
 *  ---- returns the successful pass semester of a module ----
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @returns avg semester number/range of successful pass
 *  -------------------------------------------- */
router.get("/:spId/:modAcr/semester/suc", getSucRecSemester);

/** --------------------------------------------
 *  ---- returns the key driver modules ----
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @returns key success driver modules
 *  -------------------------------------------- */
// router.get("/:spId/:modAcr/keyDrivers", getKeyDriverModules);

/** --------------------------------------------
 *  ---- returns frequent successor modules ----
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @returns array of frequent successor modules
 *  -------------------------------------------- */
router.get("/:spId/:modAcr/successors", getSuccessors);

/**
 * Returns n most frequent successor modules
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @param n contains the number of results
 *  @returns array of top n frequent successor modules
 */
router.get("/:spId/:modAcr/top:n/successors", getTopNSuccessors);

/** --------------------------------------------
 *  ---- returns commonly passed modules
 *  @param spId contains the spId of the user
 *  @returns array of frequent successor modules
 *  -------------------------------------------- */
router.get("/:spId/common-passes", getCommonlyPassedModules);

/**
 * Returns n most frequent common passes
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @param n contains the number of results
 *  @returns array of top n frequent common passes
 */
router.get("/:spId/top:n/common-passes", getTopNCommonPasses);

/**
 * Returns n less frequent common passes
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @param n contains the number of results
 *  @returns array of bottom n frequent common passes
 */
router.get("/:spId/bottom:n/commonPasses", getBottomNCommonPasses);

/** --------------------------------------------
 *  ---- returns frequent precursor modules ----
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @returns array of frequent precursor modules
 *  -------------------------------------------- */
router.get("/:spId/:modAcr/precursors", getPrecursors);

/** --------------------------------------------
 *  ---- returns correlating modules (success) ----
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @returns array of correlating modules
 *  -------------------------------------------- */
// router.get("/:spId/:modAcr/correlating", getCorrelating);

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
 *  gets a list of module recommendations for the user (topics, jobs, ...)
 *  @returns a recommendation for the user
 *  ------------------------------------ */
router.get("/personal", getPersonalRecommendations);

export { router as recs };
