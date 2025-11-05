"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studyprogrammes = void 0;
const express_1 = __importDefault(require("express"));
const studyprogrammes_controller_1 = require("./studyprogrammes.controller");
const router = express_1.default.Router();
exports.studyprogrammes = router;
router.use(express_1.default.urlencoded({ extended: false }));
router.use(express_1.default.json());
/**
 * @swagger
 * components:
 *   schemas:
 *     StudyProgramme:
 *       type: object
 *       properties:
 *         spId:
 *           type: string
 *           description: Study programme ID
 *           example: BAAng
 *         poVersion:
 *           type: integer
 *           description: PO version number
 *           example: 4
 *         name:
 *           type: string
 *           description: Programme name
 *           example: Bachelorstudiengang Angewandte Informatik
 *         desc:
 *           type: string
 *           description: Programme description
 *           example: StuFPO vom 20.08.2010 in der ÄS vom 11.10.2017
 *         date:
 *           type: string
 *           description: Programme date as string
 *           example: 30.09.2011
 *         faculty:
 *           type: string
 *           description: Faculty short name
 *           example: WIAI
 *         dep:
 *           description: Department - see schema documentation for full nested structure
 *         mhbs:
 *           description: Array of module handbooks - see schema documentation for full nested structure
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */
/**
 * @swagger
 * /studyprogrammes:
 *   get:
 *     summary: Get all study programmes
 *     tags: [StudyProgramme]
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
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', studyprogrammes_controller_1.getStudyProgrammes);
/**
 * @swagger
 * /studyprogrammes/{id}/{version}:
 *   get:
 *     summary: Get specific study programme
 *     tags: [StudyProgramme]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study programme ID
 *         example: BAAng
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: integer
 *         description: PO version
 *         example: 4
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Es konnte kein passender Eintrag gefunden werden.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/:version', studyprogrammes_controller_1.getStudyProgramme);
