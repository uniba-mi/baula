"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePersonalRecommendationsByFeedback = updatePersonalRecommendationsByFeedback;
exports.deletePersonalRecommendationsByFeedback = deletePersonalRecommendationsByFeedback;
const mongo_1 = require("../../../database/mongo");
const error_1 = require("../../../shared/error");
const feedback_service_1 = require("../../../services/feedback-service");
const validator_1 = __importDefault(require("validator"));
const module_helpers_1 = require("../../../shared/helpers/module-helpers");
async function updatePersonalRecommendationsByFeedback(req, res, next) {
    var _a, _b, _c, _d;
    try {
        const user = req.user;
        const { moduleFeedback } = req.body;
        if (!user || !user._id) {
            return next(new error_1.BadRequestError("User not authenticated"));
        }
        // if contentmatch < 3, remove existing feedback sources and skip Python call
        if (moduleFeedback.contentmatch < 3) {
            let recommendations = await mongo_1.Recommendation.findOne({ userId: user._id });
            if (recommendations && recommendations.recommendedMods) {
                recommendations.recommendedMods.forEach((mod) => {
                    if (mod.source) {
                        mod.source = mod.source.filter((s) => !(s.type === "feedback_similarmods" &&
                            s.identifier === moduleFeedback.acronym));
                        mod.frequency = mod.source.length;
                        if (mod.source.length > 0) {
                            const totalScore = mod.source.reduce((sum, s) => sum + (s.score || 0), 0);
                            mod.score = totalScore / mod.source.length;
                        }
                    }
                });
                recommendations.recommendedMods =
                    recommendations.recommendedMods.filter((mod) => mod.source && mod.source.length > 0);
                await recommendations.save();
                return res.status(200).json(recommendations);
            }
            return res
                .status(200)
                .json({ message: "No existing recommendations to update" });
        }
        const mhbId = (_b = (_a = user.sps) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.mhbId;
        const mhbVersion = (_d = (_c = user.sps) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.mhbVersion;
        if (!mhbId ||
            !mhbVersion ||
            !validator_1.default.isAlphanumeric(mhbId, undefined, { ignore: "_-" }) ||
            !validator_1.default.isInt(mhbVersion.toString())) {
            return next(new error_1.BadRequestError("No valid mhbId or mhbVersion found"));
        }
        const modules = await (0, module_helpers_1.extractModules)(mhbId, mhbVersion);
        if (!modules || modules.length === 0) {
            return next(new error_1.NotFoundError("No modules found for the given MHB information"));
        }
        // feedback embedding
        const feedbackModuleEmbedding = await mongo_1.ModEmbedding.findOne({
            acronym: moduleFeedback.acronym,
        });
        if (!feedbackModuleEmbedding || !feedbackModuleEmbedding.vector) {
            return res.status(200).json({
                message: "No embedding found for feedback module",
            });
        }
        // embeddings for all available modules in MHB
        const moduleAcronyms = modules.map((module) => module.acronym);
        const allModuleEmbeddings = await mongo_1.ModEmbedding.find({
            acronym: { $in: moduleAcronyms },
        });
        if (allModuleEmbeddings.length === 0) {
            return next(new error_1.NotFoundError("No embeddings found for available modules"));
        }
        const feedbackModuleData = {
            acronym: moduleFeedback.acronym,
            similarmodsRating: moduleFeedback.similarmods,
            vector: feedbackModuleEmbedding.vector,
        };
        const candidateModules = modules
            .map((module) => {
            const embedding = allModuleEmbeddings.find((emb) => emb.acronym === module.acronym);
            return {
                acronym: module.acronym,
                name: module.name,
                vector: (embedding === null || embedding === void 0 ? void 0 : embedding.vector) || [],
            };
        })
            .filter((mod) => mod.vector.length > 0);
        if (candidateModules.length === 0) {
            return next(new Error("No valid embeddings found for recommendation"));
        }
        // Python API call
        const recommendations = await (0, feedback_service_1.generateFeedbackBasedRecommendations)(feedbackModuleData, candidateModules, 0.65 // threshold
        );
        if (!recommendations || !recommendations.recModules) {
            return res.status(200).json({
                message: "No similar modules found above threshold",
                recommendations: { recommendedMods: [] },
            });
        }
        if (recommendations.recModules.length === 0) {
            return res.status(200).json({
                message: "No similar modules found above threshold",
                recommendations: { recommendedMods: [] },
            });
        }
        // Save recommendations
        const savedRecommendation = await saveFeedbackRecommendation(user, recommendations, moduleFeedback);
        res.status(200).json(savedRecommendation);
    }
    catch (error) {
        next(new error_1.BadRequestError("Failed to update recommendations based on feedback"));
    }
}
async function saveFeedbackRecommendation(user, result, feedback) {
    if (!user || !user._id) {
        throw new Error("Invalid user provided");
    }
    let recommendations = await mongo_1.Recommendation.findOne({
        userId: user._id,
    }).exec();
    if (!recommendations) {
        recommendations = new mongo_1.Recommendation({
            userId: user._id,
            recommendedMods: [],
            createdAt: new Date(),
        });
    }
    if (!recommendations.recommendedMods) {
        recommendations.recommendedMods = [];
    }
    for (const moduleRec of result.recModules) {
        const existingModuleIndex = recommendations.recommendedMods.findIndex((m) => m.acronym === moduleRec.acronym);
        if (existingModuleIndex >= 0) {
            const existingModule = recommendations.recommendedMods[existingModuleIndex];
            if (!existingModule.source) {
                existingModule.source = [];
            }
            // search for existing feedback or create
            const existingSourceIndex = existingModule.source.findIndex((existing) => existing.type === "feedback_similarmods" &&
                existing.identifier === feedback.acronym);
            if (existingSourceIndex === -1) {
                existingModule.source.push({
                    type: "feedback_similarmods",
                    identifier: feedback.acronym,
                    score: moduleRec.score,
                });
            }
            else {
                existingModule.source[existingSourceIndex].score = moduleRec.score;
            }
            // TODO source length
            existingModule.frequency = existingModule.source.length;
            const totalScore = existingModule.source.reduce((sum, source) => sum + (source.score || 0), 0);
            existingModule.score = totalScore / existingModule.source.length;
        }
        else {
            // new recommendation entry for module
            const newModule = {
                acronym: moduleRec.acronym,
                source: [
                    {
                        type: "feedback_similarmods",
                        identifier: feedback.acronym,
                        score: moduleRec.score,
                    },
                ],
                frequency: 1,
                score: moduleRec.score,
            };
            recommendations.recommendedMods.push(newModule);
        }
    }
    await recommendations.save();
    return recommendations;
}
async function deletePersonalRecommendationsByFeedback(req, res, next) {
    try {
        const user = req.user;
        const { acronym } = req.params;
        if (!user || !user._id) {
            return next(new error_1.BadRequestError("User not authenticated"));
        }
        if (!acronym || typeof acronym !== "string") {
            return next(new error_1.BadRequestError("Invalid module acronym"));
        }
        let recommendations = await mongo_1.Recommendation.findOne({
            userId: user._id,
        }).exec();
        if (!recommendations || !recommendations.recommendedMods) {
            return res.status(200).json({ recommendedMods: [] });
        }
        // remove feedback sources where identifier matches the acronym
        for (const recModule of recommendations.recommendedMods) {
            if (!recModule.source) {
                recModule.source = [];
                continue;
            }
            // filter out sources that are feedback-related and match the acronym
            recModule.source = recModule.source.filter((source) => { var _a; return !(((_a = source.type) === null || _a === void 0 ? void 0 : _a.includes("feedback")) && source.identifier === acronym); });
            // update frequency and score
            if (recModule.source.length > 0) {
                recModule.frequency = recModule.source.length;
                const totalScore = recModule.source.reduce((sum, source) => sum + (typeof source.score === "number" ? source.score : 0), 0);
                recModule.score = totalScore / recModule.source.length;
            }
        }
        // remove modules that no longer have any sources
        recommendations.recommendedMods = recommendations.recommendedMods.filter((recModule) => Array.isArray(recModule.source) && recModule.source.length > 0);
        await recommendations.save();
        res.status(200).json(recommendations);
    }
    catch (error) {
        next(new error_1.BadRequestError("Failed to delete feedback recommendations"));
    }
}
