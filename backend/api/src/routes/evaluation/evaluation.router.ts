import express, { Router } from "express";

const router: Router = express.Router();

/** ------------------------------------
 *  Creates data for evaluation
 *  @returns created data
 *  ------------------------------------ */
// router.post("/init", initEvaluationData);

/** ------------------------------------
 *  Gets orga (chair, programme, ...) by welcome code
 *  @param code welcome code
 *  @returns orga
 *  ------------------------------------ */
// router.get('/orga', getOrganisationByCode);

/** ------------------------------------
 *  Gets evaluations for a study programme
 *  @param spId study programme id
 *  @returns evaluations
 *  ------------------------------------ */
// router.get('/:spId', getEvaluationsBySpId);

/** ----------------------------------------
 *  Updates assignment during evaluation (gold standard)
 *  @param spId study programme id
 *  @param jobId jobId
 *  @returns updated job evaluation
 *  ---------------------------------------- */
// router.put('/:spId/job/:jobId', updateJobEvaluation);

export { router as evaluation };