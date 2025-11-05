"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudyProgrammes = getStudyProgrammes;
exports.getStudyProgramme = getStudyProgramme;
const client_1 = require("@prisma/client");
const validator_1 = __importDefault(require("validator"));
const error_1 = require("../../shared/error");
const prisma = new client_1.PrismaClient();
async function getStudyProgrammes(req, res, next) {
    prisma.studyProgramme.findMany({
        select: {
            spId: true,
            poVersion: true,
            name: true,
            desc: true,
            date: true,
            faculty: true,
            mhbs: true
        }
    })
        .then(allSp => res.status(200).json(allSp))
        .catch(() => next(new error_1.NotFoundError('In der Datenbank liegen derzeit keine Einträge vor.')));
}
;
async function getStudyProgramme(req, res, next) {
    const spId = validator_1.default.isAlphanumeric(req.params.id, undefined, { ignore: '-' }) ? req.params.id : undefined;
    const poVersion = validator_1.default.isInt(String(req.params.version)) ? Number(req.params.version) : undefined;
    if (spId && poVersion) {
        prisma.studyProgramme.findUnique({
            where: {
                spId_poVersion: {
                    spId,
                    poVersion
                }
            }
        })
            .then(result => {
            if (result) {
                res.status(200).json(result);
            }
            else {
                next(new error_1.NotFoundError("Es konnte kein passender Eintrag gefunden werden."));
            }
        })
            .catch(() => next(new error_1.BadRequestError()));
    }
    else {
        next(new error_1.BadRequestError("Keine validen Daten übergeben."));
    }
}
;
