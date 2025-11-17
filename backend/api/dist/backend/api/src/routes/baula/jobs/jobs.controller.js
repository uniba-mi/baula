"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlJob = crawlJob;
exports.generateJobKeywords = generateJobKeywords;
exports.recommendModulesToJob = recommendModulesToJob;
const job_service_1 = require("../../../services/job-service");
const validator_1 = __importDefault(require("validator"));
const mongo_1 = require("../../../database/mongo");
const mongoose_1 = __importDefault(require("mongoose"));
const error_1 = require("../../../shared/error");
const custom_validator_1 = require("../../../shared/helpers/custom-validator");
const module_helpers_1 = require("../../../shared/helpers/module-helpers");
const path_1 = __importDefault(require("path"));
const process_data_helper_1 = require("../../../shared/helpers/process-data-helper");
const jobDataFolderPath = path_1.default.join(__dirname, "../../../..", "staticdata");
// post function /crawling takes the url and returns the job information
async function crawlJob(req, res, next) {
    const url = req.body.url ? req.body.url.toString() : undefined;
    if (url) {
        if (validator_1.default.isURL(url)) {
            try {
                /* const jobInformation: Jobtemplate = await getJobInformationAndKeywords(
                  url,
                  10
                ); */
                const jobInformation = await (0, job_service_1.getJobInformation)(url);
                return res.status(200).json(jobInformation);
            }
            catch (error) {
                next(new error_1.BadRequestError());
            }
        }
        else {
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.NotFoundError());
    }
}
// generate job keywords from job information
async function generateJobKeywords(req, res, next) {
    // get job information from request body
    const title = req.body.title;
    const description = req.body.description;
    if (!title || !description) {
        next(new error_1.BadRequestError("Job title or description is missing!"));
        return;
    }
    try {
        const keywords = await (0, job_service_1.keywordRequest)(title, description, 10);
        return res.status(200).json(keywords);
    }
    catch (error) {
        next(new error_1.BadRequestError());
    }
}
// post function /job_proposal_keywords keyword list input, module list output
async function recommendModulesToJob(req, res, next) {
    var _a, _b, _c, _d;
    // get job information and user from request
    const user = req.user;
    const id = req.body.jobId && (0, custom_validator_1.validateObjectId)(req.body.jobId)
        ? req.body.jobId
        : undefined;
    // get mhbId and mhbVersion from user
    const mhbId = (_b = (_a = user.sps) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.mhbId;
    const mhbVersion = (_d = (_c = user.sps) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.mhbVersion;
    if (!mhbId ||
        !mhbVersion ||
        !validator_1.default.isAlphanumeric(mhbId, undefined, { ignore: "_-" }) ||
        !validator_1.default.isInt(mhbVersion.toString())) {
        next(new error_1.BadRequestError("No mhbId or mhbVersion found!"));
        return;
    }
    const modules = await (0, module_helpers_1.extractModules)(mhbId, mhbVersion);
    const job = (0, custom_validator_1.validateAndReturnJobtemplate)({
        title: req.body.job.title,
        description: req.body.job.description.slice(0, 2000),
        inputMode: req.body.job.inputMode,
        keywords: req.body.job.keywords,
    });
    if (!job || !modules || !user.sps || !user.sps[0].spId) {
        next(new error_1.BadRequestError("Invalid job input or modules!"));
    }
    else {
        let savedJob = await saveJob(user._id, job, id);
        if (savedJob) {
            try {
                const proposal = job.inputMode === "mock"
                    ? await getMockedJobRecommendation(job, user.sps[0].spId)
                    : await (0, job_service_1.jobModuleProposalKeyWordsRequest)(job.title, job.keywords, modules);
                if (proposal === undefined) {
                    next(new error_1.NotFoundError("Keine Modulempfehlungen gefunden."));
                    return;
                }
                await saveRecommendation(user, proposal, savedJob);
                // check for predefined jobs and return predefined recs
                return res.status(200).json({
                    ...savedJob,
                    recModules: proposal === null || proposal === void 0 ? void 0 : proposal.recModules,
                });
            }
            catch (error) {
                console.log(error);
                next(new error_1.BadRequestError());
            }
        }
        else {
            next(new error_1.BadRequestError());
        }
    }
}
/** Helper functions to save results to mongodb */
async function saveJob(uId, job, id) {
    if (id) {
        // update job
        try {
            // update job in user
            await mongo_1.User.updateOne({ _id: uId, "jobs._id": id }, {
                $set: {
                    "jobs.$.keywords": job.keywords,
                },
            });
            return {
                _id: id,
                embeddingId: "",
                ...job,
            };
        }
        catch (error) {
            return undefined;
        }
    }
    else {
        // save job
        try {
            // add job to user
            const newJob = {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                embeddingId: "",
                ...job,
            };
            await mongo_1.User.findByIdAndUpdate(uId, {
                $push: {
                    jobs: {
                        $each: [newJob],
                        $position: 0,
                    },
                },
            }, { new: true });
            return newJob;
        }
        catch (error) {
            return undefined;
        }
    }
}
// saves the result (mudule list + job) from moduleProposalKeywords
async function saveRecommendation(user, result, job) {
    // find existing recommendations for user
    let recommendations = await mongo_1.Recommendation.findOne({
        userId: user._id,
    }).exec(); // current recommendations of user
    let recModules = []; // new recommendations
    // check if recommendations and recommendedMods exist
    if (recommendations && recommendations.recommendedMods) {
        // if recco exists, check if recommendedMods is not empty
        if (recommendations.recommendedMods.length > 0) {
            // reset recommendation of requested job to prevent incosistency if keywords change
            for (const recModule of recommendations.recommendedMods) {
                recModule.source = recModule.source.filter((source) => source.identifier !== job._id);
            }
            recommendations.recommendedMods = recommendations.recommendedMods.filter((recModule) => recModule.source.length > 0);
            // recommendations exists
            for (const module of result.recModules) {
                // check if module exists in recommendations
                const index = recommendations.recommendedMods.findIndex((recModule) => recModule.acronym === module.acronym);
                if (index >= 0) {
                    // module exists in recommendations
                    const recModule = recommendations.recommendedMods[index];
                    recModule.frequency = recModule.source.push({
                        type: "job",
                        identifier: job._id,
                        score: module.score,
                    });
                    recModules.push(recModule);
                }
                else {
                    // module does not exist in recommendations
                    const newModule = createRecommendedModule(module.acronym, module.score, job._id);
                    recModules.push(newModule);
                    recommendations.recommendedMods.push(newModule);
                }
            }
        }
        else {
            // else if recommendedMods is empty
            // new recommendations
            for (const module of result.recModules) {
                const newModule = createRecommendedModule(module.acronym, module.score, job._id);
                recModules.push(newModule);
                recommendations.recommendedMods.push(newModule);
            }
        }
        try {
            await recommendations.save();
            return {
                ...job,
                recModules: recModules,
            };
        }
        catch (error) {
            console.error("Error saving recommendation or updating user:", error);
            throw new Error("Error saving recommendation or updating user"); // Fehlerbehandlung
        }
    }
    else {
        // if no recommendations currently exist
        for (const module of result.recModules) {
            const newModule = createRecommendedModule(module.acronym, module.score, job._id);
            recModules.push(newModule);
        }
        let recommendation = new mongo_1.Recommendation({
            userId: user._id,
            _id: job._id,
            jobCandidates: undefined,
            topicCandidates: undefined,
            recommendedMods: recModules,
        });
        try {
            await recommendation.save();
            return {
                ...job,
                recModules: recModules,
            };
        }
        catch (error) {
            console.error("Error saving recommendation or updating user:", error);
            throw new Error("Error saving recommendation or updating user"); // Fehlerbehandlung
        }
    }
}
function createRecommendedModule(acronym, score, id) {
    return {
        acronym: acronym,
        source: [{ type: "job", identifier: id, score: score }],
        weight: 1,
    };
}
async function getMockedJobRecommendation(job, studyprogramme) {
    const result = await (0, process_data_helper_1.readJsonFile)(`${jobDataFolderPath}/module-recommendations.json`);
    return new Promise((resolve, reject) => {
        if (result.jobs) {
            const jobData = result.jobs.find((j) => j.title === job.title);
            if (jobData && jobData.recModules) {
                resolve({
                    title: job.title,
                    keywords: job.keywords,
                    recModules: jobData.recModules.filter((m) => m.studyprogramme === studyprogramme),
                });
            }
            else {
                resolve({
                    title: job.title,
                    keywords: job.keywords,
                    recModules: [],
                });
            }
        }
    });
}
