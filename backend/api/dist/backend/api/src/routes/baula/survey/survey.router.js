"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.survey = void 0;
const express_1 = __importDefault(require("express"));
const survey_controller_1 = require("./survey.controller");
const admin_middleware_1 = require("../../../shared/middleware/admin-middleware");
const router = express_1.default.Router();
exports.survey = router;
router.use(express_1.default.json());
// save result to database
router.post('/', survey_controller_1.saveResult);
// resets all survey consenst to hasResponded = false
router.put('/reset/response', admin_middleware_1.checkAndReturnAdminUser, survey_controller_1.resetConsentResponse);
// get statistics for reporting in admin area
router.get('/report', survey_controller_1.getResults);
