"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEvaluationData = initEvaluationData;
exports.getOrganisationByCode = getOrganisationByCode;
exports.updateJobEvaluation = updateJobEvaluation;
exports.getEvaluationsBySpId = getEvaluationsBySpId;
const error_1 = require("../../shared/error");
const organisations_1 = require("../../../src/evaluationData/organisations");
const mongo_1 = require("../../database/mongo");
async function initEvaluationData(req, res, next) {
    try {
        const studyProgrammes = ['BAAng', 'BAInf', 'BAWIn', 'BKIDS', 'MAAng', 'MaCiH', 'MIISM', 'MAWin'];
        for (const spId of studyProgrammes) {
            const { candidates: candidatesData } = await Promise.resolve(`${`../../../src/evaluationData/${spId}/candidates`}`).then(s => __importStar(require(s)));
            const jobEvaluations = candidatesData.map((item) => ({
                job: {
                    jobId: item.jobId,
                },
                candidates: item.candidates.split(', ').map((acronym) => ({
                    acronym: acronym.trim()
                })),
                rankedModules: [],
                comment: '',
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            await mongo_1.Evaluation.findOneAndUpdate({ spId }, { spId, jobEvaluations }, { upsert: true, new: true, setDefaultsOnInsert: true });
        }
        res.status(200).json({ message: 'Initialisierung beendet' });
    }
    catch (error) {
        console.error(error);
        next(new error_1.BadRequestError());
    }
}
async function getOrganisationByCode(req, res, next) {
    const user = req.user;
    console.log(user.shibId);
    const orga = organisations_1.orga2code[user.shibId];
    res.status(200).json(orga);
}
async function updateJobEvaluation(req, res, next) {
    try {
        const { spId, jobId } = req.params;
        const { rankedModules, comment } = req.body;
        const evaluation = await mongo_1.Evaluation.findOne({ spId });
        if (!evaluation) {
            return next(new error_1.NotFoundError('Evaluation not found'));
        }
        const jobEvaluationIndex = evaluation.jobEvaluations.findIndex(je => je.job.jobId === jobId);
        if (jobEvaluationIndex === -1) {
            return next(new error_1.NotFoundError('Job evaluation not found'));
        }
        evaluation.jobEvaluations[jobEvaluationIndex].rankedModules = rankedModules;
        evaluation.jobEvaluations[jobEvaluationIndex].comment = comment;
        evaluation.jobEvaluations[jobEvaluationIndex].updatedAt = new Date();
        await evaluation.save();
        res.status(200).json({
            message: 'Job evaluation updated successfully',
            jobEvaluation: evaluation.jobEvaluations[jobEvaluationIndex]
        });
    }
    catch (error) {
        console.error('Error updating job evaluation:', error);
        next(new error_1.BadRequestError('Failed to update job evaluation'));
    }
}
async function getEvaluationsBySpId(req, res, next) {
    try {
        const { spId } = req.params;
        const evaluation = await mongo_1.Evaluation.findOne({ spId }).lean();
        if (!evaluation) {
            return next(new error_1.NotFoundError());
        }
        const { jobs } = await Promise.resolve().then(() => __importStar(require(`../../../src/evaluationData/jobs`)));
        const modules = require(`../../../src/evaluationData/${spId}/modules_${spId}_20252.json`);
        const evaluationWithDetails = getEvaluationDetails(evaluation, jobs, modules);
        res.status(200).json(evaluationWithDetails);
    }
    catch (error) {
        console.error(error);
        next(new error_1.BadRequestError());
    }
}
// helper function to get module and job details
function getEvaluationDetails(evaluation, jobs, modules) {
    return {
        ...evaluation,
        jobEvaluations: evaluation.jobEvaluations.map(jobEval => ({
            ...jobEval,
            job: jobs.find(j => j.jobId === jobEval.job.jobId) || { jobId: jobEval.job.jobId },
            candidates: jobEval.candidates.map(candidate => ({
                acronym: candidate.acronym,
                ...modules.find(m => m.acronym === candidate.acronym)
            })),
            rankedModules: jobEval.rankedModules.map(ranked => ({
                acronym: ranked.acronym,
                ranking: ranked.ranking,
                ...modules.find(m => m.acronym === ranked.acronym)
            }))
        }))
    };
}
