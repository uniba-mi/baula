import express, { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import validator from 'validator';
import { BadRequestError, NotFoundError } from '../../shared/error';

const router: Router = express.Router();
//false: only support simple bodys, true would support rich data
router.use(express.urlencoded({ extended: false }));
//json data will be extracted
router.use(express.json());
const prisma = new PrismaClient();

// Request to GET all studyprogrammes saved in the database
export async function getAll(req: Request, res: Response, next: NextFunction) {
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
    .catch(() => next(new NotFoundError('In der Datenbank liegen derzeit keine Einträge vor!')));
};

// Request to GET one specific studyprogramme
export async function getOne(req: Request, res: Response, next: NextFunction) {
    const spId = validator.isAlphanumeric(req.params.id, undefined, { ignore: '-'}) ? req.params.id : undefined;
    const poVersion = validator.isInt(String(req.params.version)) ? Number(req.params.version) : undefined;

    if(spId && poVersion) {
        prisma.studyProgramme.findUnique({
            where: {
                spId_poVersion: {
                    spId,
                    poVersion
                }
            }
        })
        .then(result => {
            if(result) {
                res.status(200).json(result)
            } else {
                next(new NotFoundError("Es konnte kein passender Eintrag gefunden werden."))
            }
        })
        .catch(() => next(new BadRequestError()));
    } else {
        next(new BadRequestError("Keine validen Daten übergeben!"))
    }
};