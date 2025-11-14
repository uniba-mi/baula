import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import validator from "validator";
import { BadRequestError, NotFoundError } from "../../../shared/error";
import {
  checkSemester,
  transformCourses,
  transformDozs,
} from "../../../shared/helpers/univis-helpers";

const prisma = new PrismaClient();

export async function getCourseDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const id = validator.isAlphanumeric(String(req.params.id), undefined, {
    ignore: "_.",
  })
    ? req.params.id
    : undefined;

  const semester = checkSemester(req.params.semester);

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
        dozs: transformDozs(course.dozs),
      };
      res.status(200).json(resultCourse);
    } else {
      next(new NotFoundError("The requested course could not be found."));
    }
  } else {
    next(new BadRequestError("The request was invalid or malformed."));
  }
}

export async function getCoursesBySemester(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const semester = checkSemester(req.params.semester);
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
      res.status(200).json(transformCourses(courses));
    } else {
      next(new NotFoundError("The requested courses could not be found."));
    }
  } else {
    next(new BadRequestError())
  }
}