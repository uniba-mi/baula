import { NextFunction, Request, Response } from 'express';
import { PrismaClient, Sp2Mhb, StudyProgramme as PrismaStudyProgramme } from '@prisma/client';
import validator from 'validator';
import { BadRequestError, NotFoundError } from '../../../shared/error';
import { ModuleHandbook } from '../../../../../../interfaces/module-handbook';
import { StudyProgramme } from '../../../../../../interfaces/study-programme';

const prisma = new PrismaClient();

export async function getStudyProgrammes(req: Request, res: Response, next: NextFunction) {
    try {
        const allSps = await prisma.studyProgramme.findMany({
            include: {
                mhbs: true
            }
        });
        const clientSps: StudyProgramme[] = []
        if(allSps.length === 0) {
            next(new NotFoundError('Es konnten Studiengänge gefunden werden.'))
        }
        for(let sp of allSps) {
            clientSps.push(await transformStudyprogramme(sp, sp.mhbs))
        }
        res.status(200).json(clientSps)
    } catch(error) {
        console.error(error)
        next(new BadRequestError())
    }
};

export async function getStudyProgramme(req: Request, res: Response, next: NextFunction) {
    const spId = validator.isAlphanumeric(req.params.id, undefined, { ignore: '-' }) ? req.params.id : undefined;
    const poVersion = validator.isInt(String(req.params.version)) ? Number(req.params.version) : undefined;

    if (spId && poVersion) {
        try{
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
            if(!sp) { 
                next(new NotFoundError("Es konnte kein Studiengang gefunden werden."))
            } else {
                const clientSp = await transformStudyprogramme(sp, sp.mhbs)
                res.status(200).json(clientSp)
            }
        } catch(error) {
            console.error(error)
            next(new BadRequestError())
        }
        
    } else {
        next(new BadRequestError("Keine validen Daten übergeben."))
    }
};

async function transformStudyprogramme(sp: PrismaStudyProgramme, sp2mhbs: Sp2Mhb[]): Promise<StudyProgramme> {
    let mhbs: ModuleHandbook[] = []
    for(let mhb of sp2mhbs) {
        const foundMhb = await prisma.mhb.findUnique({
            where: {
                mhbId_version: {
                    mhbId: mhb.mhbId,
                    version: mhb.version
                }                        
            }
        });
        if(!foundMhb) { continue; } 
        const { mhbId, version, name, desc, semester } = foundMhb;
        mhbs.push(new ModuleHandbook(mhbId, version, name, desc, semester))
    }
    return new Promise<StudyProgramme>((resolve, reject) => {
        resolve({
            ...sp,
            mhbs
        })
    })
}