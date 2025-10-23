import express, { Router } from "express";
import { crawlJob, generateJobKeywords, recommendModulesToJob} from "./jobproposal.controller";

const router: Router = express.Router();

/** ---------------------------------------------
 *  ---- Job URL to Keywords --------
 *  @param {String} url - The URL of the job
 *  @body {Object} - The request body containing keyword data
 *  @returns {Object} - Jobtemplate containing title and description
 *  ---------------------------------------------*/
router.post("/crawl", crawlJob);

/** ---------------------------------------------
 *  ---- Job URL to Keywords --------
 *  @param {String} job - job information (title and description)
 *  @body {Object} - The request body containing keyword data
 *  @returns {Object} - Jobtemplate containing title, description and keywords
 *  ---------------------------------------------*/
router.post("/keywords", generateJobKeywords);

/** ---------------------------------------------
 *  ---- Jobinformation to the best Modules --------
 *  @param {String} title - The title related to the keywords
 *  @param {String} description - The description related to the keywords
 *  @param {Array} keywords - List of keywords
 *  @body {Object} - The request body containing module request data
 *  @returns {Object} - JSON list of modules
 *  ---------------------------------------------*/
router.post("/recommend", recommendModulesToJob);

export { router as jobproposal };