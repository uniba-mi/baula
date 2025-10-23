import { Request, Response, NextFunction } from "express";
import { PlanCourse, Semesterplan, SemesterplanTemplate } from "../../../../../interfaces/semesterplan";
import { Studyplan } from "../../database/mongo";
import {
  validateAndReturnCourse,
  validateAndReturnUserGeneratedModule,
  validateAndReturnSemesterplan,
  validateAndReturnSemesterplanTemplate,
  validateObjectId,
} from "../../shared/customValidator";
import validator from "validator";
import { BadRequestError, logError, NotFoundError } from "../../shared/error";
import { PrismaClient } from "@prisma/client";
import { UserGeneratedModule } from "../../../../../interfaces/usergeneratedmodule";
import { UserServer } from "../../user";
import { logger } from "../../shared/logger";

const prisma = new PrismaClient();

export async function createUserGeneratedModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplanId = req.body.studyplanId?.toString() ?? undefined;
  const semesterplanId = validateObjectId(req.body.semesterplanId)
    ? req.body.semesterplanId
    : undefined;
  const module = validateAndReturnUserGeneratedModule(req.body.module);
  const ects = module && module.ects ? Number(module.ects) : 0;

  const studyplan = await findStudyplan(studyplanId);

  if (studyplan && semesterplanId && module) {
    const semesterplan = studyplan.semesterPlans.find(
      (el: Semesterplan) => el._id == semesterplanId
    );
    if (semesterplan && semesterplan.userGeneratedModules) {
      try {
        const newModuleIndex = semesterplan.userGeneratedModules.push(module);
        semesterplan.summedEcts += ects;
        await studyplan.save();
        res
          .status(200)
          .json(semesterplan.userGeneratedModules[newModuleIndex - 1]);
      } catch (error) {
        logger.error(error);
        next(new BadRequestError());
      }
    } else {
      next(
        new NotFoundError(
          "Für die angegebenen Daten konnte kein Semesterplan gefunden werden."
        )
      );
    }
  } else {
    next(new BadRequestError());
  }
}

// Hier jetzt Versuch mit findOneAndUpdate statt await studyplan save
export async function addModule(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const studyplanId =
    typeof req.body.studyplanId === "string" ? req.body.studyplanId : undefined;
  const semesterplanId = validateObjectId(req.body.semesterplanId)
    ? req.body.semesterplanId
    : undefined;
  const mod =
    typeof req.body.module === "string" &&
    validator.isAlphanumeric(req.body.module, "de-DE", { ignore: "- ." })
      ? req.body.module
      : undefined;
  const ects = !Number.isNaN(Number(req.body.ects)) ? Number(req.body.ects) : 0;

  if (studyplanId && semesterplanId && mod) {
    try {
      const updatedStudyplan = await Studyplan.findOneAndUpdate(
        { _id: studyplanId, "semesterPlans._id": semesterplanId },
        {
          $push: { "semesterPlans.$.modules": mod },
          $inc: { "semesterPlans.$.summedEcts": ects },
        },
        { new: true, runValidators: true }
      );

      if (updatedStudyplan) {
        const updatedSemesterPlan = updatedStudyplan.semesterPlans.find(
          (el: Semesterplan) => el._id.toString() === semesterplanId
        );
        if (updatedSemesterPlan) {
          res
            .status(200)
            .json(
              updatedSemesterPlan?.modules[
                updatedSemesterPlan.modules.length - 1
              ]
            );
        } else {
          next(
            new NotFoundError(
              "Semesterplan konnte im Studienplan nicht gefunden werden."
            )
          );
        }
      } else {
        next(
          new NotFoundError(
            "Für die angegebenen Daten konnte kein Semesterplan gefunden werden."
          )
        );
      }
    } catch (error) {
      logError(error);
      next(error);
    }
  } else {
    next(new BadRequestError("Invalid input data."));
  }
}

export async function updateUserGeneratedModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplanId =
    typeof req.body.studyplanId === "string" ? req.body.studyplanId : undefined;
  const semesterplanId = validateObjectId(req.body.semesterplanId)
    ? req.body.semesterplanId
    : undefined;
  const moduleId = validateObjectId(req.body.moduleId)
    ? req.body.moduleId
    : undefined;
  const module = validateAndReturnUserGeneratedModule(req.body.module);

  if (!studyplanId || !semesterplanId || !module || !moduleId) {
    return next(new BadRequestError("Ungültige Inputs"));
  }

  try {
    const studyplan = await Studyplan.findOne(
      {
        _id: studyplanId,
        "semesterPlans._id": semesterplanId,
        "semesterPlans.userGeneratedModules._id": moduleId,
      },
      { "semesterPlans.$": 1 }
    );

    if (!studyplan) {
      return next(new NotFoundError("Studienplan wurde nicht gefunden."));
    }

    const semesterplan = studyplan.semesterPlans.find(
      (el: Semesterplan) => el._id.toString() === semesterplanId
    );

    if (!semesterplan) {
      return next(new NotFoundError("Semesterplan wurde nicht gefunden."));
    }

    const moduleToUpdate = semesterplan.userGeneratedModules.find(
      (el: UserGeneratedModule) => el._id.toString() === moduleId
    );

    if (!moduleToUpdate) {
      return next(new NotFoundError("Modul wurde nicht gefunden."));
    }

    const newSummedEcts =
      semesterplan.summedEcts - moduleToUpdate.ects + module.ects;
    const updatedStudyplan = await Studyplan.findOneAndUpdate(
      {
        _id: studyplanId,
        "semesterPlans._id": semesterplanId,
        "semesterPlans.userGeneratedModules._id": moduleId,
      },
      {
        $set: {
          "semesterPlans.$[semesterplan].userGeneratedModules.$[module].ects":
            module.ects,
          "semesterPlans.$[semesterplan].userGeneratedModules.$[module].name":
            module.name,
          "semesterPlans.$[semesterplan].userGeneratedModules.$[module].notes":
            module.notes,
          "semesterPlans.$[semesterplan].summedEcts": newSummedEcts,
        },
      },
      {
        new: true,
        arrayFilters: [
          { "semesterplan._id": semesterplanId },
          { "module._id": moduleId },
        ],
        runValidators: true,
      }
    );

    if (!updatedStudyplan) {
      return next(
        new NotFoundError("Semesterplan wurde im Studienplan nicht gefunden.")
      );
    }

    const updatedSemesterPlan = updatedStudyplan.semesterPlans.find(
      (el: Semesterplan) => el._id.toString() === semesterplanId
    );

    const updatedModule = updatedSemesterPlan?.userGeneratedModules.find(
      (el: UserGeneratedModule) => el._id.toString() === moduleId
    );

    res.status(200).json(updatedModule);
  } catch (error) {
    next(error);
  }
}

export async function initSemesterplans(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id =
    typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
  const semesterplans: SemesterplanTemplate[] = req.body.semesterPlans;
  const studyplan = await findStudyplan(id);
  const user = req.user as UserServer;
  if (Array.isArray(semesterplans) && studyplan && user) {
    for (let semesterplan of semesterplans) {
      // check if userId is set correctly otherwise set it
      semesterplan.userId = semesterplan.userId ? semesterplan.userId : user._id;

      const validatedSemesterplan = validateAndReturnSemesterplan(semesterplan);
      if (validatedSemesterplan) {
        studyplan.semesterPlans.push(validatedSemesterplan);
      }
    }
    await studyplan.save();
    res.status(200).json(studyplan.semesterPlans);
  } else {
    next(new BadRequestError());
  }
}

export async function addSemesterplanToStudyplan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  const spId =
    typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
  const semester = validator.matches(req.body.semester, /\d{4}((w)|(s))/g)
    ? req.body.semester
    : undefined;
  if (spId && user._id && semester) {
    const studyplan = await findStudyplan(spId);
    if (studyplan) {
      try {
        const newSemsterplan: any = {
          modules: [],
          userGeneratedModules: [],
          courses: [],
          userId: user._id,
          semester: semester,
          isPastSemester: false,
          aimedEcts: 0,
          summedEcts: 0,
        };
        studyplan.semesterPlans.push(newSemsterplan);
        await studyplan.save();
        res.status(200).json(studyplan);
      } catch (error) {
        next(new BadRequestError());
      }
    } else {
      next(new NotFoundError("Es konnte kein Studienplan gefunden werden."));
    }
  } else {
    next(new BadRequestError());
  }
}

export async function updateSemesterplanAimedEcts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const spId =
    typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
  const semesterplanId = validateObjectId(req.body.semesterplanId)
    ? req.body.semesterplanId
    : undefined;
  const aimedEcts =
    req.body.aimedEcts &&
    validator.isInt(String(req.body.aimedEcts), { min: 0, max: 210 })
      ? Number(req.body.aimedEcts)
      : undefined;

  const studyplan = await findStudyplan(spId);

  if (studyplan && semesterplanId && aimedEcts) {
    const semesterplan = studyplan.semesterPlans.find(
      (el: Semesterplan) => el._id == semesterplanId
    );
    if (semesterplan && semesterplan.aimedEcts !== undefined) {
      semesterplan.aimedEcts = aimedEcts;
      await studyplan.save();
      res.status(200).json(semesterplan);
    } else {
      next(
        new NotFoundError("Es konnte kein passender Datensatz gefunden werden.")
      );
    }
  } else {
    next(new BadRequestError());
  }
}

export async function updateIsPastSemester(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const spId =
    typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
  const semesterplanId = validateObjectId(req.body.semesterplanId)
    ? req.body.semesterplanId
    : undefined;
  const isPast = Boolean(req.body.isPast);

  const studyplan = await findStudyplan(spId);

  if (studyplan && semesterplanId && isPast) {
    const semesterplan = studyplan.semesterPlans.find(
      (el: Semesterplan) => el._id == semesterplanId
    );

    if (semesterplan) {
      try {
        semesterplan.isPastSemester = isPast;

        await studyplan.save();
        res.status(200).json(semesterplan);
      } catch (error) {
        next(new BadRequestError());
      }
    } else {
      next(
        new NotFoundError("Es konnte kein passender Datensatz gefunden werden.")
      );
    }
  } else {
    next(new BadRequestError());
  }
}

export async function deleteModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplanId =
    typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
  const semesterplanId = validateObjectId(req.body.semesterplanId)
    ? req.body.semesterplanId
    : undefined;
  const mod = typeof req.body.module == "string" ? req.body.module : undefined;
  const ects = !Number.isNaN(Number(req.body.ects))
    ? Number(req.body.ects)
    : undefined;

  const studyplan = await findStudyplan(studyplanId);

  if (studyplan && semesterplanId && mod && ects) {
    const semesterplan = studyplan.semesterPlans.find(
      (el: Semesterplan) => el._id == semesterplanId
    );
    if (semesterplan) {
      const index = semesterplan.modules.findIndex((el: String) => el == mod);
      if (index !== -1) {
        const deleted = semesterplan.modules.splice(index, 1);
        semesterplan.summedEcts -= ects;
        // TODO: Hier tritt ein Fehler auf, wenn man ein Modul zwischen Semestern hin und her verschiebt, vermutlich weil das Hinzufügen und Löschen beide auf den studyplan zugreifen.
        await studyplan.save();
        res.status(200).json(deleted);
      } else {
        next(
          new NotFoundError("Da angefragte Modul kann nicht gelöscht werden.")
        );
      }
    } else {
      next(
        new NotFoundError(
          "Es konnte kein passender Semesterplan gefunden werden."
        )
      );
    }
  } else {
    next(new BadRequestError());
  }
}

export async function deleteUserGeneratedModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplanId =
    typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
  const semesterplanId = validateObjectId(req.body.semesterplanId)
    ? req.body.semesterplanId
    : undefined;
  const module = validateAndReturnUserGeneratedModule(req.body.module);

  const studyplan = await findStudyplan(studyplanId);

  if (studyplan && semesterplanId && module) {
    const semesterplan = studyplan.semesterPlans.find(
      (el: Semesterplan) => el._id == semesterplanId
    );
    if (semesterplan && semesterplan.userGeneratedModules) {
      const index = semesterplan.userGeneratedModules.findIndex(
        (el: UserGeneratedModule) => el._id == module._id
      );
      if (index !== -1) {
        const deleted = semesterplan.userGeneratedModules.splice(index, 1);

        semesterplan.summedEcts -= module.ects;
        await studyplan.save();
        res.status(200).json(deleted);
      } else {
        next(
          new NotFoundError(
            "Es konnte kein passender Semesterplan gefunden werden."
          )
        );
      }
    } else {
      next(
        new NotFoundError(
          "Es konnte kein passender Semesterplan gefunden werden."
        )
      );
    }
  } else {
    next(new BadRequestError());
  }
}

export async function deleteUserGeneratedModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplanId =
    typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
  const semesterplanId = validateObjectId(req.body.semesterplanId)
    ? req.body.semesterplanId
    : undefined;
  const moduleIds: string[] = Array.isArray(req.body.moduleIds)
    ? req.body.moduleIds
    : [];

  const studyplan = await findStudyplan(studyplanId);

  if (studyplan && semesterplanId && moduleIds.length > 0) {
    const semesterplan = studyplan.semesterPlans.find(
      (el: Semesterplan) => el._id == semesterplanId
    );

    if (semesterplan && semesterplan.userGeneratedModules) {
      const deletedModules: UserGeneratedModule[] = [];
      moduleIds.forEach((moduleId) => {
        const index = semesterplan.userGeneratedModules.findIndex(
          (el: UserGeneratedModule) => el._id == moduleId
        );
        if (index !== -1) {
          const [deleted] = semesterplan.userGeneratedModules.splice(index, 1);
          semesterplan.summedEcts -= deleted.ects;
          deletedModules.push(deleted);
        }
      });

      if (deletedModules.length > 0) {
        await studyplan.save();
        res.status(200).json(deletedModules);
      } else {
        next(new NotFoundError("Keine Module gefunden."));
      }
    } else {
      next(new NotFoundError("Kein Semesterplan gefunden."));
    }
  } else {
    next(new BadRequestError());
  }
}

// add course to semesterplan
export async function addCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const semester = validator.matches(req.body.semester, /\d{4}((w)|(s))/g)
    ? req.body.semester
    : undefined;
  const course = validateAndReturnCourse(req.body.course);
  const isPastSemester = Boolean(req.body.isPastSemester);
  const user = req.user as UserServer;

  if (semester && course && user._id) {
    const studyplan = await findActiveStudyplan(user._id);
    if (studyplan) {
      // find semesterplan
      const semesterplan = studyplan.semesterPlans.find(
        (el) => el.semester === semester
      );
      if (semesterplan && semesterplan.courses) {
        semesterplan.courses.push(course);
        semesterplan.isPastSemester = isPastSemester;
        try {
          await studyplan.save();
          res.status(200).json(semesterplan.courses);
        } catch (error) {
          next(new BadRequestError());
        }
      } else {
        next(new NotFoundError("Keinen passenden Semesterplan gefunden."));
      }
    } else {
      next(new NotFoundError("Keinen passenden Studienplan gefunden."));
    }
  } else {
    next(new BadRequestError());
  }
}

// delete course from semesterplan
export async function deleteCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const semester = validator.matches(req.body.semester, /\d{4}((w)|(s))/g)
    ? req.body.semester
    : undefined;
  const courseId = req.body.courseId;
  const user = req.user as UserServer;

  if (semester && courseId && user._id) {
    const studyplan = await findActiveStudyplan(user._id);
    if (studyplan) {
      // find semesterplan
      const semplan = studyplan.semesterPlans.find(
        (el) => el.semester === semester
      );
      if (semplan) {
        const index = semplan.courses.findIndex((el) => el.id == courseId);
        semplan.courses.splice(index, 1);
        try {
          await studyplan.save();
          res.status(200).json(semplan.courses);
        } catch (error) {
          next(new BadRequestError());
        }
      } else {
        next(new NotFoundError("Keinen Eintrag gefunden."));
      }
    } else {
      next(new NotFoundError("Keinen passenden Studienplan gefunden."));
    }
  } else {
    next(new BadRequestError());
  }
}

// Add multiple courses to semesterplan
export async function addCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const semester = validator.matches(req.body.semester, /\d{4}((w)|(s))/g)
    ? req.body.semester
    : undefined;
  const courses = Array.isArray(req.body.courses)
    ? req.body.courses.map(validateAndReturnCourse).filter(Boolean)
    : [];
  const isPastSemester = Boolean(req.body.isPastSemester);
  const user = req.user as UserServer;

  if (semester && courses.length > 0 && user._id) {
    const studyplan = await findActiveStudyplan(user._id);
    if (studyplan) {
      const semplan = studyplan.semesterPlans.find(
        (el) => el.semester === semester
      );
      if (semplan && semplan.courses) {
        // filter courses that are already in the plan
        const existingCourseIds = semplan.courses.map((course) => course.id);
        const newCourses = courses.filter(
          (course: PlanCourse) => !existingCourseIds.includes(course.id)
        );
        if (newCourses.length > 0) {
          semplan.courses.push(...newCourses);
        }

        semplan.isPastSemester = isPastSemester;

        try {
          await studyplan.save();
          res.status(200).json(semplan.courses);
        } catch (error) {
          next(new BadRequestError());
        }
      } else {
        next(new NotFoundError("Keinen passenden Semesterplan gefunden."));
      }
    } else {
      next(new NotFoundError("Keinen passenden Studienplan gefunden."));
    }
  } else {
    next(new BadRequestError());
  }
}

// Remove multiple courses from semesterplan
export async function deleteCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const semester = validator.matches(req.body.semester, /\d{4}((w)|(s))/g)
    ? req.body.semester
    : undefined;
  const courseIds = Array.isArray(req.body.courseIds) ? req.body.courseIds : [];
  const user = req.user as UserServer;

  if (semester && courseIds.length > 0 && user._id) {
    const studyplan = await findActiveStudyplan(user._id);
    if (studyplan) {
      const semplan = studyplan.semesterPlans.find(
        (el) => el.semester === semester
      );
      if (semplan && semplan.courses) {
        semplan.courses = semplan.courses.filter(
          (course) => !courseIds.includes(course.id)
        );
        try {
          await studyplan.save();
          res.status(200).json(semplan.courses);
        } catch (error) {
          next(new BadRequestError());
        }
      } else {
        next(new NotFoundError("Keinen passenden Semesterplan gefunden."));
      }
    } else {
      next(new NotFoundError("Keinen passenden Studienplan gefunden."));
    }
  } else {
    next(new BadRequestError());
  }
}

// get all saved courses form semesterplans and returns ExpandedCourse
export async function getAllSavedCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  // find active studyplan
  const studyplan = await findActiveStudyplan(user._id);
  if (studyplan) {
    let courses = [];
    const semesterplans = studyplan.semesterPlans;

    // extract courses
    for (let sempla of semesterplans) {
      if (sempla.courses.length !== 0) {
        const keys = sempla.courses.map((el) => el.id);
        const dbCourses = await prisma.course.findMany({
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
            AND: {
              semester: sempla.semester,
              id: {
                in: keys,
              },
            },
          },
        });
        // map MongoDB with Prisma Entries
        for (let c of sempla.courses) {
          const course = dbCourses.find(
            (el) => el.id == c.id && el.semester == sempla.semester
          );
          if (course) {
            let entry = {
              status: c.status,
              ...course,
              sws: c.sws,
              ects: c.ects,
              contributeTo: c.contributeTo,
              contributeAs: c.contributeAs,
              dozs: course.dozs.map((el) => el.person),
            };
            courses.push(entry);
          }
        }
      }
    }

    res.status(200).json(courses);
  } else {
    next(new NotFoundError("Keinen passenden Studienplan gefunden."));
  }
}

export async function importSemesterplan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const semester = validator.matches(req.body.semester, /\d{4}((w)|(s))/g)
    ? req.body.semester
    : undefined;
  const newSemesterplan = validateAndReturnSemesterplanTemplate(
    req.body.semesterplan
  );
  const user = req.user as UserServer;

  if (semester && newSemesterplan && user._id) {
    try {
      const studyplan = await findActiveStudyplan(user._id);
      if (studyplan) {
        const existingSemesterplan = studyplan.semesterPlans.find(
          (el) => el.semester === semester
        );

        if (existingSemesterplan) {
          existingSemesterplan.isPastSemester = newSemesterplan.isPastSemester;
          existingSemesterplan.courses = newSemesterplan.courses;
          await studyplan.save();
          res.json(existingSemesterplan);
        } else {
          next(
            new NotFoundError(
              "Der importierte Stundenplan ist aus einem falschen Semester"
            )
          );
        }
      } else {
        next(new NotFoundError("Keinen passenden Studienplan gefunden."));
      }
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(new BadRequestError());
  }
}

// helper functions
const findStudyplan = async (studyplanId: string) => {
  if (validateObjectId(studyplanId)) {
    return await Studyplan.findById(studyplanId).exec();
  } else {
    return undefined;
  }
};

const findActiveStudyplan = async (uId: string) => {
  return await Studyplan.findOne({
    $and: [{ userId: uId }, { status: true }],
  });
};
