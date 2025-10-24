"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStandards = getAllStandards;
exports.getSingleStandard = getSingleStandard;
exports.getAllCompetences = getAllCompetences;
exports.getCompetencesFromStandard = getCompetencesFromStandard;
exports.getUppestCompetenceGroups = getUppestCompetenceGroups;
exports.getAllUppestCompetenceGroups = getAllUppestCompetenceGroups;
exports.getAllLowerCompetences = getAllLowerCompetences;
exports.getLowerCompetences = getLowerCompetences;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
async function getAllStandards(req, res) {
    const result = await prisma.standard.findMany();
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Standards gefunden!');
    }
}
async function getSingleStandard(req, res) {
    const id = req.params.id;
    const result = await prisma.standard.findUnique({
        where: {
            stId: id
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Standards gefunden!');
    }
}
async function getAllCompetences(req, res) {
    const result = await prisma.competence.findMany();
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!');
    }
}
async function getCompetencesFromStandard(req, res) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            stId
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Zum angegebenen Standard wurden keine Kompetenzen gefunden!');
    }
}
async function getUppestCompetenceGroups(req, res) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            AND: {
                stId,
                parentId: null
            }
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Zum angegebenen Standard wurden keine Kompetenzgruppen gefunden!');
    }
}
async function getAllUppestCompetenceGroups(req, res) {
    const result = await prisma.competence.findMany({
        where: {
            parentId: null
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Kompetenzgruppen gefunden!');
    }
}
async function getAllLowerCompetences(req, res) {
    const result = await prisma.competence.findMany({
        where: {
            NOT: {
                parentId: null
            }
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!');
    }
}
async function getLowerCompetences(req, res) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            AND: {
                stId,
                NOT: {
                    parentId: null
                }
            }
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!');
    }
}
