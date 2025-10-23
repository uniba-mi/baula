import express, { Router } from "express";
import {
  getAllCompetences,
  getAllLowerCompetences,
  getAllStandards,
  getAllUppestCompetenceGroups,
  getCompetencesFromStandard,
  getLowerCompetences,
  getSingleStandard,
  getUppestCompetenceGroups,
} from "./competences.controller";

const router: Router = express.Router();
router.use(express.json());

// get all standards
router.get("/standards", getAllStandards);

// get one standard
router.get("/standard/:id", getSingleStandard);

// get all competences
router.get("/all", getAllCompetences);

// get all competences of a certain standard
router.get("/all/:id", getCompetencesFromStandard);

// get competences with specific standardId that has no parents -> uppest competenceGroups
router.get("/uppest/:id", getUppestCompetenceGroups);

// get all comptences that has no parent -> all uppest competenceGroups
router.get("/uppest", getAllUppestCompetenceGroups);

// get all competences that has a competenceGroupID --> all competence on the second level AND below
router.get("/children/uppest", getAllLowerCompetences);

// get all competences that belong to a certain competenceGroupID
router.get("/children/uppest/:id", getLowerCompetences);

export { router as competences };
