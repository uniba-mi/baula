import express, { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { BadRequestError, logError, NotFoundError } from '../../shared/error';

const router: Router = express.Router();
router.use(express.json())
const prisma = new PrismaClient();

// get distinct departements of Courses
export async function getDistinctDepartments(req: Request, res: Response, next: NextFunction) {
    try {
        const departments = await prisma.course.findMany({
            select: {
                orgname: true
            },
            distinct: ['orgname'],
            where: {
                orgname: {
                    not: {
                        equals: ''
                    }
                }
            }
        });
        if(departments) {
            // preprocess result currenty has form [{orgname: string}]
            const depAsStringArray = departments.map(el => el.orgname)
            res.status(200).json(depAsStringArray);
        } else {
            next(new NotFoundError())
        }
    } catch (error) {
        logError(error)
        next(new BadRequestError())
    }
}

// get distinct departements of Courses
export async function getDistinctCourseTypes(req: Request, res: Response, next: NextFunction) {
    try {
        const types = await prisma.course.findMany({
            select: {
                type: true
            },
            distinct: ['type'],
            where: {
                type: {
                    not: {
                        equals: ''
                    }
                }
            }
        });
        if(types) {
            // preprocess result currenty has form [{type: string}]
            const typesAsStringArray = types.map(el => el.type)
            res.status(200).json(typesAsStringArray);
        } else {
            next(new NotFoundError())
        }
    } catch (error) {
        logError(error)
        next(new BadRequestError())
    }
}