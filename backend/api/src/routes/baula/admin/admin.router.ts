import express, { Router } from "express";
import {
  addAcademicDate,
  addDateType,
  getAllAcademicDates,
  getConnectedCoursesForModule,
  getCronjobLogs,
  deleteAcademicDate,
  deleteDateType,
  updateAcademicDate,
  updateDateType,
  initConnectionModulecourse2Course,
  createCourseToModuleConnection,
  deleteCourseToModuleConnection,
  crawlCourses,
  addModuleStructureToDatabase,
  getErrorLogs,
  initTopicsFromJSON,
  updateModuleEmbeddings,
  getReporting,
  crawlFN2Modules,
  adminGetUnapprovedWishes,
  adminApproveWish,
  adminUnapproveWish,
  adminDeleteWish,
  adminAddMessageToWish,
  adminAddTagToWish,
  adminRemoveTagFromWish,
} from "./admin.controller";

const router: Router = express.Router();
router.use(express.json());

// monitoring routes
router.get("/report", getReporting);

// get Courses that are connected to the requested module
router.get("/connections/:id/:version/:semester", getConnectedCoursesForModule);
router.get("/connection", initConnectionModulecourse2Course);
router.post("/connection", createCourseToModuleConnection);
router.delete("/connection/:mcId/:cId/:semester", deleteCourseToModuleConnection);

// routes for academic dates
router.get("/academic-dates", getAllAcademicDates);
router.post("/academic-date", addAcademicDate);
router.put("/academic-date", updateAcademicDate);
router.delete("/academic-date/:id", deleteAcademicDate);

// routes for date types
router.post("/date-type", addDateType);
router.put("/date-type", updateDateType);
router.delete("/date-type/:id", deleteDateType);

// routes for recommendations

/** ------------------------------------
 *  Creates possible topics
 *  @returns created possible topics
 *  ------------------------------------ */
router.post("/topics/initialize", initTopicsFromJSON);

/** --------------------------------------------
 *  ---- updates module embeddings in the db --
 *  -------------------------------------------- */
router.post("/embeddings/modules", updateModuleEmbeddings);

// routes to read logs
router.get("/logs/cronjob", getCronjobLogs);
router.get("/logs/error", getErrorLogs);

// crawl univis
router.post("/crawling/univis", crawlCourses);

// Add a xml file containing module structure into the database
router.post('/fnmhb', addModuleStructureToDatabase);
router.get('/crawling/fnmhbs/:semester', crawlFN2Modules);

// Admin routes for feature wishes
router.get('/feature-wishes/unapproved', adminGetUnapprovedWishes);
router.post('/feature-wishes/approve/:id', adminApproveWish);
router.post('/feature-wishes/unapprove/:id', adminUnapproveWish);
router.delete('/feature-wishes/delete/:id', adminDeleteWish);

router.post('/feature-wishes/update-admin-message/:id', adminAddMessageToWish);
router.post('/feature-wishes/add-tag/:id', adminAddTagToWish);
router.delete('/feature-wishes/remove-tag/:id', adminRemoveTagFromWish);

export { router as admin };
