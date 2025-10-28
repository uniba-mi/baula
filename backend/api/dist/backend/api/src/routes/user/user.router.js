"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const router = express_1.default.Router();
exports.user = router;
router.use(express_1.default.json());
// Get Userdata via ShibId
router.get("/", user_controller_1.getUser);
// Get requests for academic dates
router.get("/academicdates/:semester", user_controller_1.getAcademicDatesBySemester);
router.get("/academicdate/:type/:semester", user_controller_1.getAcademicDateByTypeAndSemester);
router.get("/datetypes", user_controller_1.getDateTypes);
/** ---------------------------------------------
 *  ---- Create new user --------
 *  @returns the new user
 *  ---------------------------------------------*/
router.post("/", user_controller_1.createUser);
// Update requests
router.put("/", user_controller_1.updateUser);
// for updating via acronym (potentially across several semesters) use this
router.put("/studypath", user_controller_1.updateStudypath);
// for semester transition
router.put("/semester-studypath", user_controller_1.finishSemester);
// for editing a specific PathModule in the STUDYPATH by _id not acronym use this
router.put("/module", user_controller_1.updateModuleInStudypath);
router.put("/dashboard", user_controller_1.updateDashboardView);
router.put("/timetable", user_controller_1.updateTimetableSettings);
router.put("/favourite-modules-acronyms", user_controller_1.updateFavouriteModules);
router.put("/not-interesting-module-id", user_controller_1.updateNotInterestingModule);
router.put("/topic", user_controller_1.toggleTopic);
router.put("/hint", user_controller_1.updateHint);
router.put("/consents", user_controller_1.addConsents);
router.put("/module-feedback", user_controller_1.updateModuleFeedback);
router.post("/aims", user_controller_1.updateCompetenceAims);
router.delete("/favourite-modules", user_controller_1.deleteFavouriteModules);
router.delete("/not-interesting-modules", user_controller_1.deleteNotInterestingModules);
router.delete("/not-interesting-module/:acronym", user_controller_1.deleteNotInterestingModule);
router.delete("/studypath/module", user_controller_1.deleteModuleFromStudypath);
router.delete("/studypath", user_controller_1.deleteStudypath);
router.delete("/module-feedback", user_controller_1.deleteModuleFeedback);
router.post("/interest", user_controller_1.addInterest);
router.delete("/interest", user_controller_1.deleteInterest);
router.post("/fn2student", user_controller_1.crawlStudentDataViaFlexNow);
/** ---------------------------------------------
 *  ---- Delete given job and its recommended modules --------
 *  @param {String} id - The id of the job
 *  ---------------------------------------------*/
router.delete("/job", user_controller_1.deleteJob);
router.delete("/", user_controller_1.deleteUser);
