"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const error_1 = require("../shared/error");
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
//for classic routing define namespaces and include routes
const univis_router_1 = require("./univis/univis.router");
router.use("/univis", univis_router_1.univis);
const studyprogramme_router_1 = require("./studyprogramme/studyprogramme.router");
router.use("/studyprogramme", studyprogramme_router_1.studyprogramme);
const studyplans_router_1 = require("./studyplans/studyplans.router");
router.use("/studyplan", studyplans_router_1.studyplan);
const mhb_router_1 = require("./mhb/mhb.router");
router.use("/mhb", mhb_router_1.mhb);
const competences_router_1 = require("./competences/competences.router");
router.use('/competences', competences_router_1.competences);
const user_router_1 = require("./user/user.router");
router.use("/user", user_router_1.user);
const semesterplan_router_1 = require("./semesterplan/semesterplan.router");
router.use("/semesterplan", semesterplan_router_1.semesterplan);
const meta_router_1 = require("./meta/meta.router");
router.use("/meta", meta_router_1.meta);
const recs_router_1 = require("./recs/recs.router");
router.use('/recs', recs_router_1.recs);
const admin_router_1 = require("./admin/admin.router");
const adminMiddleware_1 = require("../shared/middleware/adminMiddleware");
router.use('/admin', adminMiddleware_1.checkAndReturnAdminUser, admin_router_1.admin);
const jobproposal_router_1 = require("./jobproposal/jobproposal.router");
router.use('/job-proposal', jobproposal_router_1.jobproposal);
