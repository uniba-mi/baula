import express, { Router } from "express";
import { 
    getMhbByIdAndVersion, 
    getModByAcronymAndVersion,
    getModules,
} from './module-handbooks.controller';

const router: Router = express.Router();

/**
 * @swagger
 * /module-handbooks/{id}/{version}:
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
 *         example: MHB1
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: integer
 *         description: Module handbook version
 *         example: 1
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
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: The requested module handbook could not be found with this id and version.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get('/:id/:version', getMhbByIdAndVersion);

/**
 * @swagger
 * /module-handbooks/modules/{acronym}/{version}:
 *   get:
 *     summary: Get a specific module from all modules by acronym and version
 *     tags: [ModuleHandbook::Modules]
 *     parameters:
 *       - in: path
 *         name: acronym
 *         required: true
 *         schema:
 *           type: string
 *         description: Module acronym (abbreviation)
 *         example: MOD-A
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: integer
 *         description: Module version
 *         example: 1
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
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: The requested module could not be found with this acronym and version.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get('/modules/:acronym/:version', getModByAcronymAndVersion);

/**
 * @swagger
 * /module-handbooks/modules:
 *   get:
 *     summary: Get all modules from the database
 *     tags: [ModuleHandbook::Modules]
 *     responses:
 *       200:
 *         description: All modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/Module'
 *       400:
 *         description: The request was invalid or malformed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestError'
 *       404:
 *         description: No modules could be found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get('/modules', getModules);

export { router as moduleHandbooks };