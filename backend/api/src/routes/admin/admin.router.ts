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
router.get("/academicdates", getAllAcademicDates);
router.post("/academicdate", addAcademicDate);
router.put("/academicdate", updateAcademicDate);
router.delete("/academicdate/:id", deleteAcademicDate);

// routes for datetypes
router.post("/datetype", addDateType);
router.put("/datetype", updateDateType);
router.delete("/datetype/:id", deleteDateType);

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
router.post("/crawl/univis", crawlCourses);

// Add a xml file containing module structure into the database
router.post('/fnmhb', addModuleStructureToDatabase);
router.get('/crawl/fnmhbs/:semester', crawlFN2Modules);

export { router as admin };
