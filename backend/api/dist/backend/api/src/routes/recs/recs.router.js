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
/** -----------------------------------------------------------
 *  ---- returns the information if recs are available for spId --
 *  @param spId contains the spId of the user
 *  @returns yes or no as boolean
 *  -------------------------------------------- */
router.get("/:spId/cohort-recs-available", recs_controller_1.getCohortRecsAvailableInfo);
/** --------------------------------------------
 *  ---- returns the average pass semester of a module ----
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @returns average recommended semester number/range..
 *  -------------------------------------------- */
router.get("/:spId/:modAcr/semester/avg", recs_controller_1.getAvgRecSemester);
/** --------------------------------------------
 *  ---- returns the successful pass semester of a module ----
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @returns avg semester number/range of successful pass
 *  -------------------------------------------- */
router.get("/:spId/:modAcr/semester/suc", recs_controller_1.getSucRecSemester);
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
router.get("/:spId/:modAcr/successors", recs_controller_1.getSuccessors);
/**
 * Returns n most frequent successor modules
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @param n contains the number of results
 *  @returns array of top n frequent successor modules
 */
router.get("/:spId/:modAcr/top:n/successors", recs_controller_1.getTopNSuccessors);
/** --------------------------------------------
 *  ---- returns commonly passed modules
 *  @param spId contains the spId of the user
 *  @returns array of frequent successor modules
 *  -------------------------------------------- */
router.get("/:spId/common-passes", recs_controller_1.getCommonlyPassedModules);
/**
 * Returns n most frequent common passes
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @param n contains the number of results
 *  @returns array of top n frequent common passes
 */
router.get("/:spId/top:n/common-passes", recs_controller_1.getTopNCommonPasses);
/**
 * Returns n less frequent common passes
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @param n contains the number of results
 *  @returns array of bottom n frequent common passes
 */
router.get("/:spId/bottom:n/commonPasses", recs_controller_1.getBottomNCommonPasses);
/** --------------------------------------------
 *  ---- returns frequent precursor modules ----
 *  @param spId contains the spId of the user
 *  @param modAcr contains the module acronym
 *  @returns array of frequent precursor modules
 *  -------------------------------------------- */
router.get("/:spId/:modAcr/precursors", recs_controller_1.getPrecursors);
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
 *  gets a list of module recommendations for the user (topics, jobs, ...)
 *  @returns a recommendation for the user
 *  ------------------------------------ */
router.get("/personal", recs_controller_1.getPersonalRecommendations);
