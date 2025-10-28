import express, { Router } from "express";
import {
  getUser,
  createUser,
  addInterest,
  deleteInterest,
  updateUser,
  updateModuleInStudypath,
  deleteModuleFromStudypath,
  updateDashboardView,
  updateCompetenceAims,
  deleteStudypath,
  deleteUser,
  updateHint,
  deleteNotInterestingModules,
  deleteNotInterestingModule,
  updateNotInterestingModule,
  updateFavouriteModules,
  deleteFavouriteModules,
  addConsents,
  getAcademicDateByTypeAndSemester,
  getAcademicDatesBySemester,
  getDateTypes,
  updateStudypath,
  updateTimetableSettings,
  deleteJob,
  finishSemester,
  toggleTopic,
  updateModuleFeedback,
  crawlStudentDataViaFlexNow,
  deleteModuleFeedback,
} from "./user.controller";

const router: Router = express.Router();
router.use(express.json());

// Get Userdata via ShibId
router.get("/", getUser);

// Get requests for academic dates
router.get("/academicdates/:semester", getAcademicDatesBySemester);
router.get("/academicdate/:type/:semester", getAcademicDateByTypeAndSemester);
router.get("/datetypes", getDateTypes);

/** ---------------------------------------------
 *  ---- Create new user --------
 *  @returns the new user
 *  ---------------------------------------------*/
router.post("/", createUser);

// Update requests
router.put("/", updateUser);

// for updating via acronym (potentially across several semesters) use this
router.put("/studypath", updateStudypath);

// for semester transition
router.put("/semester-studypath", finishSemester);

// for editing a specific PathModule in the STUDYPATH by _id not acronym use this
router.put("/module", updateModuleInStudypath);

router.put("/dashboard", updateDashboardView);

router.put("/timetable", updateTimetableSettings);

router.put("/favourite-modules-acronyms", updateFavouriteModules);

router.put("/not-interesting-module-id", updateNotInterestingModule);

router.put("/topic", toggleTopic) 

router.put("/hint", updateHint);

router.put("/consents", addConsents);

router.put("/module-feedback", updateModuleFeedback);

router.post("/aims", updateCompetenceAims);

router.delete("/favourite-modules", deleteFavouriteModules);

router.delete("/not-interesting-modules", deleteNotInterestingModules);

router.delete("/not-interesting-module/:acronym", deleteNotInterestingModule);

router.delete("/studypath/module", deleteModuleFromStudypath);

router.delete("/studypath", deleteStudypath);

router.delete("/module-feedback", deleteModuleFeedback)

router.post("/interest", addInterest);

router.delete("/interest", deleteInterest);

router.post("/fn2student", crawlStudentDataViaFlexNow);

/** ---------------------------------------------
 *  ---- Delete given job and its recommended modules --------
 *  @param {String} id - The id of the job
 *  ---------------------------------------------*/
router.delete("/job", deleteJob)

router.delete("/", deleteUser)

export { router as user };
