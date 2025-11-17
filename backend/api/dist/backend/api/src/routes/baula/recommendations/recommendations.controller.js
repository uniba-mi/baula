"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalRecommendations = getPersonalRecommendations;
const mongo_1 = require("../../../database/mongo");
const error_1 = require("../../../shared/error");
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
