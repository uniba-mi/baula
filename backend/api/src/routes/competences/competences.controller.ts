import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router: Router = express.Router();
router.use(express.json())
const prisma = new PrismaClient();

export async function getAllStandards(req: Request, res: Response) {
    const result = await prisma.standard.findMany();
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Standards gefunden!')
    }
}

export async function getSingleStandard(req: Request, res: Response) {
    const id = req.params.id;

    const result = await prisma.standard.findUnique({
        where: {
            stId: id
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Standards gefunden!')
    }
}

export async function getAllCompetences(req: Request, res: Response) {
    const result = await prisma.competence.findMany();
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!')
    }
}

export async function getCompetencesFromStandard(req: Request, res: Response) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            stId
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Zum angegebenen Standard wurden keine Kompetenzen gefunden!')
    }
}

export async function getUppestCompetenceGroups(req: Request, res: Response) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            AND: {
                stId,
                parentId: null
            }
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Zum angegebenen Standard wurden keine Kompetenzgruppen gefunden!')
    }
}

export async function getAllUppestCompetenceGroups(req: Request, res: Response) {
    const result = await prisma.competence.findMany({
        where: {
            parentId: null
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Kompetenzgruppen gefunden!')
    }
}

export async function getAllLowerCompetences(req: Request, res: Response) {
    const result = await prisma.competence.findMany({
        where: {
            NOT: {
                parentId: null
            }
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!')
    }
}

export async function getLowerCompetences(req: Request, res: Response) {
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
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!')
    }
}