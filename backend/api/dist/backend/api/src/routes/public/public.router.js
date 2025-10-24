"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formdata = void 0;
const express_1 = __importDefault(require("express"));
const competences_controller_1 = require("../competences/competences.controller");
const public_controller_1 = require("./public.controller");
const router = express_1.default.Router();
exports.formdata = router;
// Get mhb-structure from specific id
router.get('/modules', public_controller_1.getUniqueModules);
// Add a xml file containing module structure into the database
router.get('/competences', competences_controller_1.getAllLowerCompetences);
// get mod from id and version
router.get('/standards', competences_controller_1.getAllStandards);
// get all courses from Bilapp
router.get('/courses/:semester', public_controller_1.getBilAppCourses);
// get competence and module connection of course
router.get('/course/:id', public_controller_1.getCompetenceAndModulesOfCourse);
