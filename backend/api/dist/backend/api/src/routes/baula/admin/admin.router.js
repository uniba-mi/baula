"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const router = express_1.default.Router();
exports.admin = router;
router.use(express_1.default.json());
// monitoring routes
router.get("/report", admin_controller_1.getReporting);
// get Courses that are connected to the requested module
router.get("/connections/:id/:version/:semester", admin_controller_1.getConnectedCoursesForModule);
router.get("/connection", admin_controller_1.initConnectionModulecourse2Course);
router.post("/connection", admin_controller_1.createCourseToModuleConnection);
router.delete("/connection/:mcId/:cId/:semester", admin_controller_1.deleteCourseToModuleConnection);
// routes for academic dates
router.get("/academic-dates", admin_controller_1.getAllAcademicDates);
router.post("/academic-date", admin_controller_1.addAcademicDate);
router.put("/academic-date", admin_controller_1.updateAcademicDate);
router.delete("/academic-date/:id", admin_controller_1.deleteAcademicDate);
// routes for date types
router.post("/date-type", admin_controller_1.addDateType);
router.put("/date-type", admin_controller_1.updateDateType);
router.delete("/date-type/:id", admin_controller_1.deleteDateType);
// routes for recommendations
/** ------------------------------------
 *  Creates possible topics
 *  @returns created possible topics
 *  ------------------------------------ */
router.post("/topics/initialize", admin_controller_1.initTopicsFromJSON);
/** --------------------------------------------
 *  ---- updates module embeddings in the db --
 *  -------------------------------------------- */
router.post("/embeddings/modules", admin_controller_1.updateModuleEmbeddings);
// routes to read logs
router.get("/logs/cronjob", admin_controller_1.getCronjobLogs);
router.get("/logs/error", admin_controller_1.getErrorLogs);
// crawl univis
router.post("/crawling/univis", admin_controller_1.crawlCourses);
// Add a xml file containing module structure into the database
router.post('/fnmhb', admin_controller_1.addModuleStructureToDatabase);
router.get('/crawling/fnmhbs/:semester', admin_controller_1.crawlFN2Modules);
