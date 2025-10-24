"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobproposal = void 0;
const express_1 = __importDefault(require("express"));
const jobproposal_controller_1 = require("./jobproposal.controller");
const router = express_1.default.Router();
exports.jobproposal = router;
/** ---------------------------------------------
 *  ---- Job URL to Keywords --------
 *  @param {String} url - The URL of the job
 *  @body {Object} - The request body containing keyword data
 *  @returns {Object} - Jobtemplate containing title and description
 *  ---------------------------------------------*/
router.post("/crawl", jobproposal_controller_1.crawlJob);
/** ---------------------------------------------
 *  ---- Job URL to Keywords --------
 *  @param {String} job - job information (title and description)
 *  @body {Object} - The request body containing keyword data
 *  @returns {Object} - Jobtemplate containing title, description and keywords
 *  ---------------------------------------------*/
router.post("/keywords", jobproposal_controller_1.generateJobKeywords);
/** ---------------------------------------------
 *  ---- Jobinformation to the best Modules --------
 *  @param {String} title - The title related to the keywords
 *  @param {String} description - The description related to the keywords
 *  @param {Array} keywords - List of keywords
 *  @body {Object} - The request body containing module request data
 *  @returns {Object} - JSON list of modules
 *  ---------------------------------------------*/
router.post("/recommend", jobproposal_controller_1.recommendModulesToJob);
