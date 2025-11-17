import { Router } from "express";
declare const router: Router;
/** ------------------------------------
 *  Creates data for evaluation
 *  @returns created data
 *  ------------------------------------ */
/** ------------------------------------
 *  Gets orga (chair, programme, ...) by welcome code
 *  @param code welcome code
 *  @returns orga
 *  ------------------------------------ */
/** ------------------------------------
 *  Gets evaluations for a study programme
 *  @param spId study programme id
 *  @returns evaluations
 *  ------------------------------------ */
/** ----------------------------------------
 *  Updates assignment during evaluation (gold standard)
 *  @param spId study programme id
 *  @param jobId jobId
 *  @returns updated job evaluation
 *  ---------------------------------------- */
export { router as evaluation };
