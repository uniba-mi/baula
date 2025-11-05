"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const error_1 = require("../shared/error");
const swagger_config_1 = require("../config/swagger.config");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const authenticationMiddleware_1 = require("../shared/middleware/authenticationMiddleware");
const router = express_1.default.Router();
exports.api = router;
router.use(express_1.default.json());
router.get("/", (req, res, next) => {
    if (req.user) {
        res.status(200).json({ user: req.user });
    }
    else {
        next(new error_1.BadRequestError());
    }
});
router.use(authenticationMiddleware_1.ensureAuthenticated);
// use swagger for api docs
router.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerConfig));
// for classic routing define namespaces and include routes
const courses_router_1 = require("./courses/courses.router");
router.use("/courses", courses_router_1.courses);
const studyprogrammes_router_1 = require("./studyprogrammes/studyprogrammes.router");
router.use("/studyprogrammes", studyprogrammes_router_1.studyprogrammes);
const studyplans_router_1 = require("./studyplans/studyplans.router");
router.use("/studyplan", studyplans_router_1.studyplan);
const mhbs_router_1 = require("./mhbs/mhbs.router");
router.use("/mhbs", mhbs_router_1.mhbs);
const competences_router_1 = require("./competences/competences.router");
router.use('/competences', competences_router_1.competences);
const user_router_1 = require("./user/user.router");
router.use("/user", user_router_1.user);
const semesterplans_router_1 = require("./semesterplans/semesterplans.router");
router.use("/semesterplan", semesterplans_router_1.semesterplans); // TODO semesterplans + in RestService too
const meta_router_1 = require("./meta/meta.router");
router.use("/meta", meta_router_1.meta);
const recs_router_1 = require("./recs/recs.router");
router.use('/recs', recs_router_1.recs);
const admin_router_1 = require("./admin/admin.router");
const adminMiddleware_1 = require("../shared/middleware/adminMiddleware");
router.use('/admin', adminMiddleware_1.checkAndReturnAdminUser, admin_router_1.admin);
const jobproposal_router_1 = require("./jobproposal/jobproposal.router");
router.use('/job-proposal', jobproposal_router_1.jobproposal);
const evaluation_router_1 = require("./evaluation/evaluation.router");
router.use('/evaluation', evaluation_router_1.evaluation);
const survey_router_1 = require("./survey/survey.router");
router.use('/survey', survey_router_1.survey);
