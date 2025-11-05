"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJsonFile = readJsonFile;
exports.getTopicTree = getTopicTree;
exports.getTopicChildren = getTopicChildren;
exports.recommendModulesByTopicsPreGenerated = recommendModulesByTopicsPreGenerated;
exports.getPersonalRecommendations = getPersonalRecommendations;
exports.updatePersonalRecommendationsByFeedback = updatePersonalRecommendationsByFeedback;
exports.deletePersonalRecommendationsByFeedback = deletePersonalRecommendationsByFeedback;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const mongo_1 = require("../../database/mongo");
const error_1 = require("../../shared/error");
const topicService_1 = require("../../services/topicService");
const feedbackService_1 = require("../../services/feedbackService");
const validator_1 = __importDefault(require("validator"));
const moduleHelpers_1 = require("../../shared/helpers/moduleHelpers");
const router = express_1.default.Router();
router.use(express_1.default.json());
/**
 * Generic helper function. Reads a JSON file and parses it into a JS object.
 * @param {string} filePath - The path to the JSON file to be read.
 * @returns {Promise<T>} - Promise with parsed JSON data as type T.
 * @template T - The type of the expected data structure that the JSON file contains.
 */
async function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const jsonData = JSON.parse(data.toString());
                resolve(jsonData);
            }
            catch (parseError) {
                reject(parseError);
            }
        });
    });
}
async function getTopicTree(req, res, next) {
    try {
        const topics = await mongo_1.TopicM.find();
        // create map for lookup by tId
        const topicMap = {};
        topics.forEach((topic) => {
            topicMap[topic.tId] = {
                tId: topic.tId,
                name: topic.name,
                keywords: topic.keywords || [],
                description: topic.description,
                embeddingId: topic.embeddingId || undefined,
                parentId: topic.parentId,
                createdAt: topic.createdAt || undefined,
                updatedAt: topic.updatedAt || undefined,
                children: [],
            };
        });
        // build tree structure
        const rootTopics = [];
        Object.values(topicMap).forEach((topic) => {
            if (topic.parentId && topicMap[topic.parentId]) {
                topicMap[topic.parentId].children.push(topic);
            }
            else {
                rootTopics.push(topic);
            }
        });
        res.status(200).json({ topics: rootTopics });
    }
    catch (error) {
        next(new error_1.BadRequestError('Fehler beim Abrufen des Themenbaums'));
    }
}
async function getTopicChildren(req, res, next) {
    try {
        const topics = await mongo_1.TopicM.find({ parentId: { $ne: null } });
        res.status(200).json(topics);
    }
    catch (error) {
        next(new error_1.BadRequestError('Fehler beim Abrufen der Themen'));
    }
}
/* Pre-Generated Embeddings */
async function recommendModulesByTopicsPreGenerated(req, res, next) {
    var _a, _b, _c, _d;
    const { tIds } = req.body;
    if (!Array.isArray(tIds)) {
        return next(new error_1.BadRequestError("Invalid topic IDs."));
    }
    try {
        // Step 1: Validate user and extract MHB information
        const user = req.user;
        const mhbId = (_b = (_a = user.sps) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.mhbId;
        const mhbVersion = (_d = (_c = user.sps) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.mhbVersion;
        if (!mhbId ||
            !mhbVersion ||
            !validator_1.default.isAlphanumeric(mhbId, undefined, { ignore: "_-" }) ||
            !validator_1.default.isInt(mhbVersion.toString())) {
            next(new error_1.BadRequestError("No mhbId or mhbVersion found!"));
            return;
        }
        // Empty topics case: Save with empty topics to clear existing recommendations
        if (tIds.length === 0) {
            const savedRecommendation = await saveTopicRecommendation(user, { recModules: [] }, []);
            return res.status(200).json(savedRecommendation);
        }
        // Step 2: Fetch topics and validate
        const topics = await mongo_1.TopicM.find({ tId: { $in: tIds } });
        if (topics.length === 0) {
            return next(new error_1.NotFoundError("No topics found for the provided IDs."));
        }
        // Step 3: Extract modules using MHB ID and version
        const modules = await (0, moduleHelpers_1.extractModules)(mhbId, mhbVersion);
        if (!modules || modules.length === 0) {
            return next(new error_1.NotFoundError("No modules found for the given MHB information."));
        }
        // Step 4: Fetch pre-generated embeddings for modules and topics
        const topicEmbeddings = await mongo_1.Embedding.find({
            identifier: { $in: tIds }
        });
        if (topicEmbeddings.length === 0) {
            return next(new error_1.NotFoundError("No embeddings found for the selected topics."));
        }
        const moduleAcronyms = modules.map(module => module.acronym);
        // Fetch module embeddings from ModEmbeddings
        const moduleEmbeddings = await mongo_1.ModEmbedding.find({
            acronym: { $in: moduleAcronyms }
        });
        if (moduleEmbeddings.length === 0) {
            return next(new error_1.NotFoundError("No embeddings found for available modules."));
        }
        // Step 5: Prepare data for recommendation function
        const topicsForRecommendation = topics.map(topic => {
            const embedding = topicEmbeddings.find(emb => emb.identifier === topic.tId);
            return {
                tId: topic.tId,
                name: topic.name,
                description: topic.description || "",
                vector: (embedding === null || embedding === void 0 ? void 0 : embedding.vector) || []
            };
        }).filter(topic => topic.vector.length > 0);
        const modulesForRecommendation = modules.map(module => {
            const embedding = moduleEmbeddings.find(emb => emb.acronym === module.acronym);
            return {
                acronym: module.acronym,
                name: module.name,
                content: module.content || "",
                skills: module.skills || "",
                vector: (embedding === null || embedding === void 0 ? void 0 : embedding.vector) || []
            };
        }).filter(module => module.vector.length > 0);
        if (topicsForRecommendation.length === 0) {
            return next(new Error("No valid topic embeddings found for recommendation."));
        }
        if (modulesForRecommendation.length === 0) {
            return next(new Error("No valid module embeddings found for recommendation."));
        }
        // Step 6: Call Python API for recommendations
        const recommendations = await (0, topicService_1.generateTopicModuleRecommendationsPreGenerated)(topicsForRecommendation, modulesForRecommendation);
        if (!recommendations || !recommendations.recModules) {
            return next(new Error("Failed to generate module recommendations."));
        }
        // Step 7: Save recommendations
        const savedRecommendation = await saveTopicRecommendation(user, recommendations, topics);
        res.status(200).json(savedRecommendation);
    }
    catch (error) {
        console.error("ERROR:", error.message);
        console.error("Error generating recommendations:", error);
        next(new error_1.BadRequestError("Failed to generate recommendations"));
    }
}
// saves the result (module list + topics) from topic recommendation process
async function saveTopicRecommendation(user, result, topics) {
    if (!user || !user._id) {
        throw new Error("Invalid user provided");
    }
    if (!result || !Array.isArray(result.recModules)) {
        throw new Error("Invalid recommendation result");
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
    // remove all topic-based sources but preserve others if topics array is empty
    if (!Array.isArray(topics) || topics.length === 0) {
        if (recommendations.recommendedMods.length > 0) {
            for (const recModule of recommendations.recommendedMods) {
                if (!recModule.source) {
                    recModule.source = [];
                    continue;
                }
                const hasNonTopicSources = recModule.source.some(source => source.type !== "topic");
                recModule.source = recModule.source.filter(source => source.type !== "topic");
                if (recModule.source.length > 0) {
                    recModule.frequency = recModule.source.length;
                    const totalScore = recModule.source.reduce((sum, source) => sum + (typeof source.score === 'number' ? source.score : 0), 0);
                    recModule.score = totalScore / recModule.source.length;
                }
                else if (hasNonTopicSources) {
                    recModule.score = 0;
                }
            }
            recommendations.recommendedMods = recommendations.recommendedMods.filter(recModule => Array.isArray(recModule.source) && recModule.source.length > 0);
        }
        await recommendations.save();
        return recommendations;
    }
    const topicMap = new Map();
    topics.forEach(topic => {
        if (topic.tId) {
            topicMap.set(topic.tId, topic);
        }
    });
    const tIds = topics
        .map(topic => topic.tId)
        .filter(id => id !== undefined && id !== null);
    // remove existing sources for these topics
    if (recommendations.recommendedMods.length > 0) {
        for (const recModule of recommendations.recommendedMods) {
            if (!recModule.source) {
                recModule.source = [];
                continue;
            }
            recModule.source = recModule.source.filter(source => source.type !== "topic" || tIds.includes(source.identifier));
        }
        // remove modules without sources
        recommendations.recommendedMods = recommendations.recommendedMods.filter(recModule => Array.isArray(recModule.source) && recModule.source.length > 0);
    }
    const processedModules = [];
    for (const moduleRec of result.recModules) {
        const existingModuleIndex = recommendations.recommendedMods.findIndex(m => m.acronym === moduleRec.acronym);
        if (existingModuleIndex >= 0) {
            const existingModule = recommendations.recommendedMods[existingModuleIndex];
            // Ensure source array exists
            if (!existingModule.source) {
                existingModule.source = [];
            }
            // Add new sources from topics
            for (const source of moduleRec.sources) {
                if (topicMap.has(source.identifier)) {
                    const existingSourceIndex = existingModule.source.findIndex(existing => existing.type === "topic" && existing.identifier === source.identifier);
                    if (existingSourceIndex === -1) {
                        existingModule.source.push({
                            type: "topic",
                            identifier: source.identifier,
                            score: source.score
                        });
                    }
                }
            }
            existingModule.frequency = existingModule.source.length;
            if (existingModule.source.length > 0) {
                const totalScore = existingModule.source.reduce((sum, source) => sum + (typeof source.score === 'number' ? source.score : 0), 0);
                existingModule.score = totalScore / existingModule.source.length;
            }
            else {
                existingModule.score = 0;
            }
            processedModules.push(existingModule);
        }
        else {
            const validSources = moduleRec.sources
                .filter(source => topicMap.has(source.identifier))
                .map(source => ({
                type: "topic",
                identifier: source.identifier,
                score: source.score
            }));
            const newModule = {
                acronym: moduleRec.acronym,
                source: validSources,
                frequency: validSources.length,
                score: moduleRec.score
            };
            recommendations.recommendedMods.push(newModule);
            processedModules.push(newModule);
        }
    }
    try {
        await recommendations.save();
        return recommendations;
    }
    catch (error) {
        console.error("Error saving recommendations:", error);
        console.error("Save ERROR:", error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to save recommendations: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function getPersonalRecommendations(req, res, next) {
    try {
        const user = req.user;
        const recommendations = await mongo_1.Recommendation.find({ userId: user._id });
        res.status(200).json(recommendations);
    }
    catch (error) {
        next(new error_1.BadRequestError('Fehler beim Abruf der Empfehlung'));
    }
}
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
                        mod.source = mod.source.filter((s) => !(s.type === 'feedback_similarmods' && s.identifier === moduleFeedback.acronym));
                        mod.frequency = mod.source.length;
                        if (mod.source.length > 0) {
                            const totalScore = mod.source.reduce((sum, s) => sum + (s.score || 0), 0);
                            mod.score = totalScore / mod.source.length;
                        }
                    }
                });
                recommendations.recommendedMods = recommendations.recommendedMods.filter((mod) => mod.source && mod.source.length > 0);
                await recommendations.save();
                return res.status(200).json(recommendations);
            }
            return res.status(200).json({ message: "No existing recommendations to update" });
        }
        const mhbId = (_b = (_a = user.sps) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.mhbId;
        const mhbVersion = (_d = (_c = user.sps) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.mhbVersion;
        if (!mhbId ||
            !mhbVersion ||
            !validator_1.default.isAlphanumeric(mhbId, undefined, { ignore: "_-" }) ||
            !validator_1.default.isInt(mhbVersion.toString())) {
            return next(new error_1.BadRequestError("No valid mhbId or mhbVersion found"));
        }
        const modules = await (0, moduleHelpers_1.extractModules)(mhbId, mhbVersion);
        if (!modules || modules.length === 0) {
            return next(new error_1.NotFoundError("No modules found for the given MHB information"));
        }
        // feedback embedding
        const feedbackModuleEmbedding = await mongo_1.ModEmbedding.findOne({
            acronym: moduleFeedback.acronym,
        });
        if (!feedbackModuleEmbedding || !feedbackModuleEmbedding.vector) {
            return res.status(200).json({
                message: "No embedding found for feedback module"
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
        const recommendations = await (0, feedbackService_1.generateFeedbackBasedRecommendations)(feedbackModuleData, candidateModules, 0.65 // threshold
        );
        if (!recommendations || !recommendations.recModules) {
            return res.status(200).json({
                message: "No similar modules found above threshold",
                recommendations: { recommendedMods: [] }
            });
        }
        if (recommendations.recModules.length === 0) {
            return res.status(200).json({
                message: "No similar modules found above threshold",
                recommendations: { recommendedMods: [] }
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
        if (!acronym || typeof acronym !== 'string') {
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
            recModule.source = recModule.source.filter(source => {
                var _a;
                return !(((_a = source.type) === null || _a === void 0 ? void 0 : _a.includes('feedback')) &&
                    source.identifier === acronym);
            });
            // update frequency and score
            if (recModule.source.length > 0) {
                recModule.frequency = recModule.source.length;
                const totalScore = recModule.source.reduce((sum, source) => sum + (typeof source.score === 'number' ? source.score : 0), 0);
                recModule.score = totalScore / recModule.source.length;
            }
        }
        // remove modules that no longer have any sources
        recommendations.recommendedMods = recommendations.recommendedMods.filter(recModule => Array.isArray(recModule.source) && recModule.source.length > 0);
        await recommendations.save();
        res.status(200).json(recommendations);
    }
    catch (error) {
        next(new error_1.BadRequestError("Failed to delete feedback recommendations"));
    }
}
