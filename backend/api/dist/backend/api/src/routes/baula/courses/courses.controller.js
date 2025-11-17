"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseDetails = getCourseDetails;
exports.getCoursesBySemester = getCoursesBySemester;
const client_1 = require("@prisma/client");
const validator_1 = __importDefault(require("validator"));
const error_1 = require("../../../shared/error");
const univis_helpers_1 = require("../../../shared/helpers/univis-helpers");
const prisma = new client_1.PrismaClient();
async function getCourseDetails(req, res, next) {
    const id = validator_1.default.isAlphanumeric(String(req.params.id), undefined, {
        ignore: "_.",
    })
        ? req.params.id
        : undefined;
    const semester = (0, univis_helpers_1.checkSemester)(req.params.semester);
    if (id && semester) {
        const course = await prisma.course.findUnique({
            include: {
                dozs: {
                    select: {
                        person: true,
                    },
                },
                terms: {
                    include: {
                        room: true,
                    },
                },
                competence: {
                    select: {
                        cId: true,
                        semester: true,
                        compId: true,
                        fulfillment: true,
                    },
                },
                mCourses: {
                    select: {
                        modCourse: true,
                    },
                },
            },
            where: {
                id_semester: {
                    id,
                    semester,
                },
            },
        });
        if (course) {
            const resultCourse = {
                ...course,
                dozs: (0, univis_helpers_1.transformDozs)(course.dozs),
            };
            res.status(200).json(resultCourse);
        }
        else {
            next(new error_1.NotFoundError("The requested course could not be found."));
        }
    }
    else {
        next(new error_1.BadRequestError("The request was invalid or malformed."));
    }
}
async function getCoursesBySemester(req, res, next) {
    const semester = (0, univis_helpers_1.checkSemester)(req.params.semester);
    if (semester) {
        const courses = await prisma.course.findMany({
            orderBy: {
                name: "asc",
            },
            include: {
                dozs: {
                    select: {
                        person: true,
                    },
                },
                terms: {
                    include: {
                        room: true,
                    },
                },
                competence: {
                    select: {
                        cId: true,
                        semester: true,
                        compId: true,
                        fulfillment: true,
                    },
                },
                mCourses: {
                    select: {
                        modCourse: true,
                    },
                },
            },
            where: {
                semester: {
                    equals: semester,
                },
            }
        });
        if (courses) {
            res.status(200).json((0, univis_helpers_1.transformCourses)(courses));
        }
        else {
            next(new error_1.NotFoundError("The requested courses could not be found."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
