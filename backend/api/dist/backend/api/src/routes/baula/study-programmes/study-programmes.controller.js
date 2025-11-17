"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudyProgrammes = getStudyProgrammes;
exports.getStudyProgramme = getStudyProgramme;
const client_1 = require("@prisma/client");
const validator_1 = __importDefault(require("validator"));
const error_1 = require("../../../shared/error");
const module_handbook_1 = require("../../../../../../interfaces/module-handbook");
const prisma = new client_1.PrismaClient();
async function getStudyProgrammes(req, res, next) {
    try {
        const allSps = await prisma.studyProgramme.findMany({
            include: {
                mhbs: true
            }
        });
        const clientSps = [];
        if (allSps.length === 0) {
            next(new error_1.NotFoundError('Es konnten Studiengänge gefunden werden.'));
        }
        for (let sp of allSps) {
            clientSps.push(await transformStudyprogramme(sp, sp.mhbs));
        }
        res.status(200).json(clientSps);
    }
    catch (error) {
        console.error(error);
        next(new error_1.BadRequestError());
    }
}
;
async function getStudyProgramme(req, res, next) {
    const spId = validator_1.default.isAlphanumeric(req.params.id, undefined, { ignore: '-' }) ? req.params.id : undefined;
    const poVersion = validator_1.default.isInt(String(req.params.version)) ? Number(req.params.version) : undefined;
    if (spId && poVersion) {
        try {
            const sp = await prisma.studyProgramme.findUnique({
                where: {
                    spId_poVersion: {
                        spId,
                        poVersion
                    }
                },
                include: {
                    mhbs: true
                }
            });
            if (!sp) {
                next(new error_1.NotFoundError("Es konnte kein Studiengang gefunden werden."));
            }
            else {
                const clientSp = await transformStudyprogramme(sp, sp.mhbs);
                res.status(200).json(clientSp);
            }
        }
        catch (error) {
            console.error(error);
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.BadRequestError("Keine validen Daten übergeben."));
    }
}
;
async function transformStudyprogramme(sp, sp2mhbs) {
    let mhbs = [];
    for (let mhb of sp2mhbs) {
        const foundMhb = await prisma.mhb.findUnique({
            where: {
                mhbId_version: {
                    mhbId: mhb.mhbId,
                    version: mhb.version
                }
            }
        });
        if (!foundMhb) {
            continue;
        }
        const { mhbId, version, name, desc, semester } = foundMhb;
        mhbs.push(new module_handbook_1.ModuleHandbook(mhbId, version, name, desc, semester));
    }
    return new Promise((resolve, reject) => {
        resolve({
            ...sp,
            mhbs
        });
    });
}
