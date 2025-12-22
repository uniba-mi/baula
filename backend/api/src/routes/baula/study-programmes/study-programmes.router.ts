import express, { Router } from 'express';
import {
    getStudyProgramme,
    getStudyProgrammes
} from './study-programmes.controller';

const router: Router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

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
router.get('/', getStudyProgrammes);

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
router.get('/:id/:version', getStudyProgramme);

export { router as studyProgrammes };