"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studyProgrammes = void 0;
const express_1 = __importDefault(require("express"));
const study_programmes_controller_1 = require("./study-programmes.controller");
const router = express_1.default.Router();
exports.studyProgrammes = router;
router.use(express_1.default.urlencoded({ extended: false }));
router.use(express_1.default.json());
/**
 * @swagger
 * /study-programmes:
 *   get:
 *     summary: Get all study programmes
 *     tags: [Study Programmes]
 *     responses:
 *       200:
 *         description: List of all study programmes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudyProgramme'
 *       404:
 *         description: In der Datenbank liegen derzeit keine Einträge vor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get('/', study_programmes_controller_1.getStudyProgrammes);
/**
 * @swagger
 * /study-programmes/{id}/{version}:
 *   get:
 *     summary: Get specific study programme
 *     tags: [Study Programmes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study programme ID
 *         example: SP1
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: integer
 *         description: PO version
 *         example: 1
 *     responses:
 *       200:
 *         description: Study programme
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudyProgramme'
 *       400:
 *         description: Keine validen Daten übergeben.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: Es konnte kein passender Eintrag gefunden werden.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get('/:id/:version', study_programmes_controller_1.getStudyProgramme);
