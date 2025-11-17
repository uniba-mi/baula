"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobInformationAndKeywords = getJobInformationAndKeywords;
exports.getJobInformation = getJobInformation;
exports.jobModuleProposalKeyWordsRequest = jobModuleProposalKeyWordsRequest;
exports.keywordRequest = keywordRequest;
const job_scraping_1 = require("../shared/helpers/job-scraping");
const error_1 = require("../shared/error");
const validator_1 = __importDefault(require("validator"));
const winston_1 = require("winston");
const request_1 = require("./request");
/** -----------------------------
 *  --- Initializing constants --
 *  -----------------------------*/
const pathjobModuleProposalKeyWords = "/recommend-modules-for-job";
const pathgetKeyWords = "/job-keywords";
/** ---------------------------------------------
 *  ---- Create Keyword Request Function --------
 *  @param jobUrl - The URL of the job to be scraped for keywords.
 *  @param resultLimit - The maximum number of results to return (default is 5).
 *  @returns The results of the keyword request from the scraping process.
 *
 *  This function decodes the job URL if it is URL-encoded, scrapes the
 *  relevant title and description using the provided job URL, and
 *  performs a keyword request based on the scraped data. If no description
 *  is found, a message is logged, and the function returns early.
 *  If resultLimit is not provided, it defaults to 5.
 *  ---------------------------------------------*/
async function getJobInformationAndKeywords(jobUrl, resultLimit) {
    try {
        // Decode the job URL if it is URL-encoded
        if (jobUrl.includes("%3A%2F%2F")) {
            if (validator_1.default.isURL(jobUrl)) {
                jobUrl = decodeURIComponent(jobUrl);
            }
            else {
                throw new Error("Invalid URL");
            }
        }
        // Scrape the title and description from the job URL
        const [title, desc] = await (0, job_scraping_1.scrapAfaSsWebsite)(jobUrl);
        // Check if a description was found
        if (desc === undefined) {
            console.error("Something went wrong:", jobUrl);
            throw new error_1.BadRequestError("No description found");
        }
        // Set default result limit if not provided
        if (!resultLimit) {
            resultLimit = 5;
        }
        // Perform the keyword request
        const jobInformation = await keywordRequest(title, desc, resultLimit);
        return jobInformation;
    }
    catch (error) {
        // Log any errors that occur during the process
        (0, error_1.logError)(error);
        console.error("Error occurred while creating keyword request:", error);
    }
}
async function getJobInformation(jobUrl) {
    try {
        // Decode the job URL if it is URL-encoded
        if (jobUrl.includes("%3A%2F%2F")) {
            if (validator_1.default.isURL(jobUrl)) {
                jobUrl = decodeURIComponent(jobUrl);
            }
            else {
                throw new Error("Invalid URL");
            }
        }
        // Scrape the title and description from the job URL
        const [title, desc] = await (0, job_scraping_1.scrapAfaSsWebsite)(jobUrl);
        // Check if a description was found
        if (desc === undefined) {
            console.error("Something went wrong:", jobUrl);
            throw new error_1.BadRequestError("No description found");
        }
        return { title, description: desc, inputMode: 'url', keywords: [] };
    }
    catch (error) {
        // Log any errors that occur during the process
        (0, error_1.logError)(error);
        console.error("Error occurred while creating keyword request:", error);
    }
}
/** ---------------------------------------------
 *  ---- Job Module Proposal Keywords Request Function --------
 *  @param title - The title of the job proposal.
 *  @param keywords - A string containing keywords associated with the job proposal.
 *  @param modules - An array of modules associated with the job proposal.
 *
 *  @returns A promise that resolves to the result of the POST request
 *           to create keyword proposals for the job.
 *
 *  This function constructs a data object containing the title, keywords,
 *  MHB ID, and version, and sends a POST request to the job module proposal
 *  keywords endpoint using the postFetchData function. Any errors during
 *  the request are logged to the console.
 *  ---------------------------------------------*/
async function jobModuleProposalKeyWordsRequest(title, keywords, modules) {
    const data = {
        title: title,
        keywords: keywords.join(", "),
        modules: modules,
    };
    try {
        const result = (await (0, request_1.postFetchData)(pathjobModuleProposalKeyWords, data));
        return result;
    }
    catch (error) {
        (0, error_1.logError)(error);
    }
}
/** ---------------------------------------------
 *  ---- Keyword Request Function --------
 *  @param title - The title for which keywords are to be generated.
 *  @param description - The description providing context for the keywords.
 *  @param keywordNumber - The number of keywords to generate.
 *
 *  @returns A promise that resolves to the response of the keyword request.
 *
 *  This function constructs a data object containing the title, description,
 *  and the desired number of keywords, and sends a POST request to the
 *  keyword generation endpoint using the postFetchData function.
 *  Any errors during the request are logged to the console.
 *  ---------------------------------------------*/
async function keywordRequest(title, description, keywordNumber) {
    // Validate required parameters
    if (title && description && keywordNumber) {
        if (validator_1.default.isNumeric(keywordNumber.toString())) {
            // Construct the data object for the request
            const data = {
                title: title,
                description: description,
                keywordNumber: keywordNumber,
            };
            try {
                // Send the POST request and await the result
                const response = await (0, request_1.postFetchData)(pathgetKeyWords, data);
                return response;
            }
            catch (error) {
                (0, error_1.logError)(error);
                throw new Error("Something went wrong");
            }
        }
    }
    else {
        (0, error_1.logError)(winston_1.error);
        throw new Error("Something is wrong");
    }
}
