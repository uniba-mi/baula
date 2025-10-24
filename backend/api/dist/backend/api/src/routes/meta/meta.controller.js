"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistinctDepartments = getDistinctDepartments;
exports.getDistinctCourseTypes = getDistinctCourseTypes;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const error_1 = require("../../shared/error");
const router = express_1.default.Router();
router.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
// get distinct departements of Courses
async function getDistinctDepartments(req, res, next) {
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
        if (departments) {
            // preprocess result currenty has form [{orgname: string}]
            const depAsStringArray = departments.map(el => el.orgname);
            res.status(200).json(depAsStringArray);
        }
        else {
            next(new error_1.NotFoundError());
        }
    }
    catch (error) {
        (0, error_1.logError)(error);
        next(new error_1.BadRequestError());
    }
}
// get distinct departements of Courses
async function getDistinctCourseTypes(req, res, next) {
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
        if (types) {
            // preprocess result currenty has form [{type: string}]
            const typesAsStringArray = types.map(el => el.type);
            res.status(200).json(typesAsStringArray);
        }
        else {
            next(new error_1.NotFoundError());
        }
    }
    catch (error) {
        (0, error_1.logError)(error);
        next(new error_1.BadRequestError());
    }
}
