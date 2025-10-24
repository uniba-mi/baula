"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.competences = void 0;
const express_1 = __importDefault(require("express"));
const competences_controller_1 = require("./competences.controller");
const router = express_1.default.Router();
exports.competences = router;
router.use(express_1.default.json());
// get all standards
router.get("/standards", competences_controller_1.getAllStandards);
// get one standard
router.get("/standard/:id", competences_controller_1.getSingleStandard);
// get all competences
router.get("/all", competences_controller_1.getAllCompetences);
// get all competences of a certain standard
router.get("/all/:id", competences_controller_1.getCompetencesFromStandard);
// get competences with specific standardId that has no parents -> uppest competenceGroups
router.get("/uppest/:id", competences_controller_1.getUppestCompetenceGroups);
// get all comptences that has no parent -> all uppest competenceGroups
router.get("/uppest", competences_controller_1.getAllUppestCompetenceGroups);
// get all competences that has a competenceGroupID --> all competence on the second level AND below
router.get("/children/uppest", competences_controller_1.getAllLowerCompetences);
// get all competences that belong to a certain competenceGroupID
router.get("/children/uppest/:id", competences_controller_1.getLowerCompetences);
