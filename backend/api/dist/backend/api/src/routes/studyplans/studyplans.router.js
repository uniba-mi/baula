"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studyplan = void 0;
const express_1 = __importDefault(require("express"));
const studyplans_controller_1 = require("./studyplans.controller");
const router = express_1.default.Router();
exports.studyplan = router;
//false: only support simple bodys, true would support rich data
router.use(express_1.default.urlencoded({ extended: false }));
//json data will be extracted
router.use(express_1.default.json());
// GET REQUESTS
/** --------------------------------------------
 *  ---- Returns all studyplans of one user ----
 *  @returns Array of Studyplans
 *  -------------------------------------------- */
router.get("/all", studyplans_controller_1.getAllStudyplansOfUser);
/** ---------------------------------------------
 *  ---- Return active studyplan of user --------
 *  @returns the active studyplan
 *  ---------------------------------------------*/
router.get("/active", studyplans_controller_1.getActiveStudyplan);
/** --------------------------------------------
 *  ---- Returns all studyplan templates of the user's degree program ----
 *  @param programId contains the programId to return all studplans of this program
 *  @param semesterType contains the type of semester, ws or ss
 *  @returns Latest studyplan template
 *  -------------------------------------------- */
router.get("/latest-template/:programId/:semesterType", studyplans_controller_1.getLatestTemplateForStudyProgram);
/** --------------------------------------------
 *  ---- Returns if the degree program has studyplan templates ----
 *  @param programId contains the programId to return all studplans of this program
 *  @param semesterType contains the type of semester, ws or ss
 *  @returns Latest studyplan template
 *  -------------------------------------------- */
router.get("/template-availablilty/:programId/:semesterType", studyplans_controller_1.checkStudyplanTemplateAvailability);
// CREATE REQUESTS
/** ---------------------------------------------
 *  ---------- Creates a new studyplan ----------
 *  @param studyplan contains a valid studyplan object
 *  @returns if succeed than returns studyplan otherwise error
 *  --------------------------------------------- */
router.post("/", studyplans_controller_1.createStudyplan);
// UPDATE REQUESTS
/** ----------------------------------------
 *  Updates name and/or status of studyplan
 *  @param Studyplan contains a object of type studyplan
 *  ---------------------------------------- */
router.put("/", studyplans_controller_1.updateStudyplan);
/** ----------------------------------------
 *  Adds modules to all existing studyplans
 *  @param modules contains the modules to add
 *  @param semesterName contains the semester where the modules should be added (cannot detect that automatically because currentSemester may mismatch with user studyplan current semester)
 *  @returns the updated studyplans
 *  ---------------------------------------- */
router.post("/all", studyplans_controller_1.addModulesToCurrentSemesterOfAllStudyplans);
/** ----------------------------------------
 *  Transfer a module from one semesterplan to another
 *  @param studyplanId contains the id of the studyplan
 *  @param oldSemesterplanId contains id of old semesterplan
 *  @param newSemesterplanId contains id of new semesterplan
 *  @param acronym contains acronym of module to be transfered
    ---------------------------------------------------------- */
router.put("/transfer/module", studyplans_controller_1.transferModule);
/** ----------------------------------------
 *  Transfer a module from one semesterplan to another
 *  @param studyplanId contains the id of the studyplan
 *  @param oldSemesterplanId contains id of old semesterplan
 *  @param newSemesterplanId contains id of new semesterplan
 *  @param module contains module to be transfered
    ---------------------------------------------------------- */
router.put("/transfer/user-generated-module", studyplans_controller_1.transferUserGeneratedModule);
// DELETE REQUESTS
/** ------------------------------------------
 *  ------- Delete of one studplan -----------
 *  @param id contains the _id of the studyplan
 *  Both params are needed to specify the studyplan to be deleted
    ------------------------------------------ */
router.delete("/:id", studyplans_controller_1.deleteStudyplan);
