"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluation = void 0;
const express_1 = __importDefault(require("express"));
const evaluation_controller_1 = require("./evaluation.controller");
const router = express_1.default.Router();
exports.evaluation = router;
/** ------------------------------------
 *  Creates data for evaluation
 *  @returns created data
 *  ------------------------------------ */
router.post("/init", evaluation_controller_1.initEvaluationData);
/** ------------------------------------
 *  Gets orga (chair, programme, ...) by welcome code
 *  @param code welcome code
 *  @returns orga
 *  ------------------------------------ */
router.get('/orga', evaluation_controller_1.getOrganisationByCode);
/** ------------------------------------
 *  Gets evaluations for a study programme
 *  @param spId study programme id
 *  @returns evaluations
 *  ------------------------------------ */
router.get('/:spId', evaluation_controller_1.getEvaluationsBySpId);
/** ----------------------------------------
 *  Updates assignment during evaluation (gold standard)
 *  @param spId study programme id
 *  @param jobId jobId
 *  @returns updated job evaluation
 *  ---------------------------------------- */
router.put('/:spId/job/:jobId', evaluation_controller_1.updateJobEvaluation);
