"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.semesterplans = void 0;
const express_1 = __importDefault(require("express"));
const semesterplans_controller_1 = require("./semesterplans.controller");
//using router to forward request
const router = express_1.default.Router();
exports.semesterplans = router;
//false: only support simple bodys, true would support rich data
router.use(express_1.default.urlencoded({ extended: false }));
//json data will be extracted
router.use(express_1.default.json());
// get courses from all semesterplans
router.get("/courses", semesterplans_controller_1.getAllSavedCourses);
// #############################
// GENERAL SEMESTERPLAN REQUESTS
// #############################
/** ------------------------------------
 *  Creates semesterplans for specific studyplan
 *  @param studyplanId contains _id of studyplan
 *  @param semesterPlans contains semesterplans
 *  @returns created semesterplans
 *  ------------------------------------ */
router.post("/init", semesterplans_controller_1.initSemesterplans);
/** ------------------------------------
 *  Gets a semesterplan and adds it to a studyplan (at the end of)
 *  @param studyplanId contains _id of studyplan
 *  @param semester of the plan that should be created
 *  @returns created semesterplans
 */
router.post("/", semesterplans_controller_1.addSemesterplanToStudyplan);
/** -----------------------------------------
 * Replaces existing semesterplan with imported semesterplan
 * @param semesterplan as type of SemesterplanTemplate
 * @param semester of the imported semesterplan
 * -----------------------------------------*/
router.put("/", semesterplans_controller_1.importSemesterplan);
/** ----------------------------------------
 * Updates aimedECTS of Study semesterplan
 * @param studyplanId
 * @param semesterplanId
 * @param aimedEcts
 *  ---------------------------------------- */
router.put("/aimed-ects", semesterplans_controller_1.updateSemesterplanAimedEcts);
/** ----------------------------------------
* Updates isPastSemester property of semesterplan
* @param studyplanId
* @param semesterplanId
* @param isPast
*  ---------------------------------------- */
router.put("/is-past-semester", semesterplans_controller_1.updateIsPastSemester);
// ########################
// COURSE SPECIFIC REQUESTS
// ########################
router.post("/course", semesterplans_controller_1.addCourse);
router.post("/courses", semesterplans_controller_1.addCourses);
router.delete("/course", semesterplans_controller_1.deleteCourse);
router.delete("/courses", semesterplans_controller_1.deleteCourses);
// ########################
// MODULE SPECIFIC REQUESTS
// ########################
/**
 * Adds a new module to the studyplan
 * @param studyplanId
 * @param semesterplanId
 * @param module
 * @param ects
 */
router.post("/module", semesterplans_controller_1.addModule);
/**
 * @param studyplanId
 * @param semesterplanId
 * @param module
 */
router.post("/user-generated-module", semesterplans_controller_1.createUserGeneratedModule);
/** ----------------------------------------
 * Updates user generated module of Study semesterplan
 * @param studyplanId
 * @param semesterplanId
 * @param module
 *  ---------------------------------------- */
router.put("/user-generated-module", semesterplans_controller_1.updateUserGeneratedModule);
router.delete("/module", semesterplans_controller_1.deleteModule);
router.delete("/user-generated-module", semesterplans_controller_1.deleteUserGeneratedModule);
router.delete("/user-generated-modules", semesterplans_controller_1.deleteUserGeneratedModules);
