import express, { Router } from "express";
import {
  createStudyplan,
  updateStudyplan,
  getAllStudyplansOfUser,
  deleteStudyplan,
  getActiveStudyplan,
  transferModule,
  transferUserGeneratedModule,
  getLatestTemplateForStudyProgram,
  checkStudyplanTemplateAvailability,
  addModulesToCurrentSemesterOfAllStudyplans
} from "./studyplans.controller";

const router: Router = express.Router();
//false: only support simple bodys, true would support rich data
router.use(express.urlencoded({ extended: false }));
//json data will be extracted
router.use(express.json());

// GET REQUESTS
/** --------------------------------------------
 *  ---- Returns all studyplans of one user ----
 *  @returns Array of Studyplans
 *  -------------------------------------------- */
router.get("/all", getAllStudyplansOfUser);

/** ---------------------------------------------
 *  ---- Return active studyplan of user --------
 *  @returns the active studyplan
 *  ---------------------------------------------*/
router.get("/active", getActiveStudyplan);

/** --------------------------------------------
 *  ---- Returns all studyplan templates of the user's degree program ----
 *  @param programId contains the programId to return all studplans of this program
 *  @param semesterType contains the type of semester, ws or ss
 *  @returns Latest studyplan template
 *  -------------------------------------------- */
router.get("/latest-template/:programId/:semesterType", getLatestTemplateForStudyProgram);

/** --------------------------------------------
 *  ---- Returns if the degree program has studyplan templates ----
 *  @param programId contains the programId to return all studplans of this program
 *  @param semesterType contains the type of semester, ws or ss
 *  @returns Latest studyplan template
 *  -------------------------------------------- */
router.get("/template-availablilty/:programId/:semesterType", checkStudyplanTemplateAvailability);

// CREATE REQUESTS
/** ---------------------------------------------
 *  ---------- Creates a new studyplan ----------
 *  @param studyplan contains a valid studyplan object
 *  @returns if succeed than returns studyplan otherwise error
 *  --------------------------------------------- */
router.post("/", createStudyplan);

// UPDATE REQUESTS
/** ----------------------------------------
 *  Updates name and/or status of studyplan
 *  @param Studyplan contains a object of type studyplan
 *  ---------------------------------------- */
router.put("/", updateStudyplan);

/** ----------------------------------------
 *  Adds modules to all existing studyplans
 *  @param modules contains the modules to add
 *  @param semesterName contains the semester where the modules should be added (cannot detect that automatically because currentSemester may mismatch with user studyplan current semester)
 *  @returns the updated studyplans
 *  ---------------------------------------- */
router.post("/all", addModulesToCurrentSemesterOfAllStudyplans);

/** ----------------------------------------
 *  Transfer a module from one semesterplan to another
 *  @param studyplanId contains the id of the studyplan
 *  @param oldSemesterplanId contains id of old semesterplan
 *  @param newSemesterplanId contains id of new semesterplan
 *  @param acronym contains acronym of module to be transfered
    ---------------------------------------------------------- */
router.put("/transfer/module", transferModule)

/** ----------------------------------------
 *  Transfer a module from one semesterplan to another
 *  @param studyplanId contains the id of the studyplan
 *  @param oldSemesterplanId contains id of old semesterplan
 *  @param newSemesterplanId contains id of new semesterplan
 *  @param module contains module to be transfered
    ---------------------------------------------------------- */
router.put("/transfer/user-generated-module", transferUserGeneratedModule)

// DELETE REQUESTS
/** ------------------------------------------
 *  ------- Delete of one studplan -----------
 *  @param id contains the _id of the studyplan
 *  Both params are needed to specify the studyplan to be deleted
    ------------------------------------------ */
router.delete("/:id", deleteStudyplan);

export { router as studyplan };
