import express, { Router } from "express";
import { 
    getMhbByIdAndVersion, 
    getModByAcronymAndVersion,
    getModules,
} from './mhbs.controller';

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Module:
 *       type: object
 *       properties:
 *         m_id:
 *           type: string
 *           description: Module id
 *           example: 10
 *         version:
 *           type: integer
 *           description: Module version number
 *           example: 5
 *         name:
 *           type: string
 *           description: Module name
 *           example: Computergrafik und Animation
 *         content:
 *           type: string
 *           description: Module content
 *           example: The module is about...
 *         skills:
 *           type: string
 *           description: Module skills
 *           example: Students learn how to discuss the topic of...
 *         add_info:
 *           type: string
 *           description: Other additional content from the module handbook
 *           example: The module is offered in English.
 *         prior_knowledge:
 *           type: string
 *           description: Prior knowledge for the module in textual form.
 *           example: Basic knowledge in the topic of...
 *         ects:
 *           type: number
 *           description: Module's credit points
 *           example: 6
 *         term:
 *           type: string
 *           description: The term the module is offered in
 *           example: WS, SS
 *         rec_term:
 *           type: string
 *           description: The term the module handbook recommends the module should be taken in.
 *           example: 1-2
 *         duration:
 *           type: string
 *           description: The duration of the module in semesters
 *           example: 1
 *         chair:
 *           type: string
 *           description: The chair that offers the module
 *           example: Lehrstuhl für Computergrafik
 *         prevModules:
 *           type: Module
 *           description: Prior knowledge in Module form
 *           example: TODO
 *         respPersonId:
 *           type: string
 *           description: Reference to responsible person
 *           example: 684
 *         offer_begin: TODO
 *         offer_end: TODO
 *         workload: TODO
 *     ModuleHandbook (Mhb):
 *       type: object
 *       properties:
 *         mhb_id:
 *           type: string
 *           description: Module handbook id
 *           example: 17025
 *         name:
 *           type: string
 *           description: Name of the module handbook
 *           example: Bachelor Software Systems Science (ab WS 2015/16)
 *         desc:
 *           type: string
 *           description: Description of the module handbook with reference to "Prüfungs- und Studienordnung" and valid date
 *           example: Gemäß der geltenden Fassung...
 *         version:
 *           type: number
 *           description: Module handbook version
 *           example: 19
 *         semester:
 *           type: string
 *           description: The semester the module handbook is valid from
 *           example: Sommersemester 2024
 *         spId:
 *           type: string
 *           description: Reference to study programme
 *           example: BAAng
 *         poVersion:
 *           type: string
 *           description: Reference to version of "Prüfungs- und Studienordnung" 
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /mhbs/modules/{acronym}/{version}:
 *   get:
 *     summary: Get a specific module from all modules by acronym and version
 *     tags: [Module]
 *     parameters:
 *       - in: path
 *         name: acronym
 *         required: true
 *         schema:
 *           type: string
 *         description: Module acronym (abbreviation)
 *         example: HCI-IS-B
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: integer
 *         description: Module version
 *         example: 2
 *     responses:
 *       200:
 *         description: Module
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       400:
 *         description: The request was invalid or malformed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: The requested module could not be found with this acronym and version.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/modules/:acronym/:version', getModByAcronymAndVersion);

/**
 * @swagger
 * /mhbs:
 *   get:
 *     summary: Get all modules from the database
 *     tags: [ModuleHandbook]
 *     responses:
 *       200:
 *         description: Module
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       400:
 *         description: The request was invalid or malformed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No modules could be found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/modules', getModules);

// TODO remove if not need anymore
// router.get('/current-modules', getCurrentModules);

/**
 * @swagger
 * /mhbs/{id}/{version}:
 *   get:
 *     summary: Get a specific module handbook structure by id and version
 *     tags: [ModuleHandbook]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module handbook id
 *         example: 17963
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: integer
 *         description: Module handbook version
 *         example: 8
 *     responses:
 *       200:
 *         description: Module handbook
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleHandbook'
 *       400:
 *         description: The request was invalid or malformed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: The requested module handbook could not be found with this id and version.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/:version', getMhbByIdAndVersion);

export { router as mhbs };