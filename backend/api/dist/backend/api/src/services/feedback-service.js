"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeedbackBasedRecommendations = generateFeedbackBasedRecommendations;
const request_1 = require("./request");
const pathFeedbackModuleRecommendation = "/feedback-module-recommendations";
/**
 * Fetch similar module recommendations based on user feedback using pre-generated embeddings.
 * @param feedbackModule - The module with positive feedback including its embedding.
 * @param candidateModules - Array of all available modules with their embeddings.
 * @param threshold - Minimum similarity score (default 0.65).
 * @returns Promise resolving to recommendations from the Python API.
 */
async function generateFeedbackBasedRecommendations(feedbackModule, candidateModules, threshold = 0.65) {
    if (!feedbackModule.vector || feedbackModule.vector.length === 0) {
        throw new Error("Invalid feedback module embedding.");
    }
    if (!Array.isArray(candidateModules) || candidateModules.length === 0) {
        throw new Error("Invalid candidate modules data.");
    }
    const data = {
        feedbackModule: {
            acronym: feedbackModule.acronym,
            vector: feedbackModule.vector,
            rating: feedbackModule.similarmodsRating,
        },
        candidateModules: candidateModules.map((module) => ({
            acronym: module.acronym,
            vector: module.vector,
        })),
        threshold: threshold,
    };
    try {
        const result = await (0, request_1.postFetchData)(pathFeedbackModuleRecommendation, data);
        return result;
    }
    catch (error) {
        throw new Error("Failed to fetch feedback-based recommendations.");
    }
}
