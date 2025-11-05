"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveResult = saveResult;
exports.resetConsentResponse = resetConsentResponse;
const express_1 = __importDefault(require("express"));
const error_1 = require("../../shared/error");
const customValidator_1 = require("../../shared/helpers/customValidator");
const mongo_1 = require("../../database/mongo");
const validator_1 = __importDefault(require("validator"));
const router = express_1.default.Router();
//false: only support simple bodys, true would support rich data
router.use(express_1.default.urlencoded({ extended: false }));
//json data will be extracted
router.use(express_1.default.json());
async function saveResult(req, res, next) {
    const result = (0, customValidator_1.validateAndReturnSurveyResult)(req.body.result);
    if (result) {
        result.feedback = result.feedback ? validator_1.default.blacklist(result.feedback, '[$<>;{}\[\]()\'"`=]') : '';
        try {
            const savedResult = await mongo_1.LongTermEvaluation.create({
                ...result
            });
            res.status(200).send(savedResult);
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
async function resetConsentResponse(req, res, next) {
    try {
        const users = await mongo_1.User.find({ "consents.ctype": "bakule-survey" });
        if (users.length !== 0) {
            for (let user of users) {
                user.consents.forEach(consent => {
                    if (consent.ctype === 'bakule-survey') {
                        consent.hasResponded = false;
                    }
                });
                await user.save();
            }
            res.status(200).json('Consent wurde erfolgreich zurückgesetzt.');
        }
        else {
            next(new error_1.NotFoundError("Es konnten keine Consents gefunden werden."));
        }
    }
    catch (error) {
        console.log(error);
        next(new error_1.BadRequestError());
    }
}
