import { Request, Response, NextFunction } from "express";
import { PlanCourse, SemesterPlan, SemesterPlanTemplate } from "../../../../../../interfaces/semester-plan";
import { StudyPlan } from "../../../database/mongo";
import {
  validateAndReturnCourse,
  validateAndReturnUserGeneratedModule,
  validateAndReturnSemesterPlan,
  validateAndReturnSemesterPlanTemplate,
  validateObjectId,
} from "../../../shared/helpers/custom-validator";
import validator from "validator";
import { BadRequestError, logError, NotFoundError } from "../../../shared/error";
import { PrismaClient } from "@prisma/client";
import { UserGeneratedModule } from "../../../../../../interfaces/user-generated-module";
import { UserServer } from "../../../../../../interfaces/user";
import { logger } from "../../../shared/utils/logger";
import { findActiveStudyPlan, findStudyPlan } from "../../../shared/helpers/plan-helper";

const prisma = new PrismaClient();

export async function createUserGeneratedModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyPlanId = req.body.studyPlanId?.toString() ?? undefined;
  const semesterPlanId = validateObjectId(req.body.semesterPlanId)
    ? req.body.semesterPlanId
    : undefined;
  const module = validateAndReturnUserGeneratedModule(req.body.module);
  const ects = module && module.ects ? Number(module.ects) : 0;

  const studyPlan = await findStudyPlan(studyPlanId);

  if (studyPlan && semesterPlanId && module) {
    const semesterPlan = studyPlan.semesterPlans.find(
      (el: SemesterPlan) => el._id == semesterPlanId
    );
    if (semesterPlan && semesterPlan.userGeneratedModules) {
      try {
        const newModuleIndex = semesterPlan.userGeneratedModules.push(module);
        semesterPlan.summedEcts += ects;
        await studyPlan.save();
        res
          .status(200)
          .json(semesterPlan.userGeneratedModules[newModuleIndex - 1]);
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

// Hier jetzt Versuch mit findOneAndUpdate statt await study plan save
export async function addModule(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const studyPlanId =
    typeof req.body.studyPlanId === "string" ? req.body.studyPlanId : undefined;
  const semesterPlanId = validateObjectId(req.body.semesterPlanId)
    ? req.body.semesterPlanId
    : undefined;
  const mod =
    typeof req.body.module === "string" &&
    validator.isAlphanumeric(req.body.module, "de-DE", { ignore: "- ." })
      ? req.body.module
      : undefined;
  const ects = !Number.isNaN(Number(req.body.ects)) ? Number(req.body.ects) : 0;

  if (studyPlanId && semesterPlanId && mod) {
    try {
      const updatedStudyPlan = await StudyPlan.findOneAndUpdate(
        { _id: studyPlanId, "semesterPlans._id": semesterPlanId },
        {
          $push: { "semesterPlans.$.modules": mod },
          $inc: { "semesterPlans.$.summedEcts": ects },
        },
        { new: true, runValidators: true }
      );

      if (updatedStudyPlan) {
        const updatedSemesterPlan = updatedStudyPlan.semesterPlans.find(
          (el: SemesterPlan) => el._id.toString() === semesterPlanId
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
  const studyPlanId =
    typeof req.body.studyPlanId === "string" ? req.body.studyPlanId : undefined;
  const semesterPlanId = validateObjectId(req.body.semesterPlanId)
    ? req.body.semesterPlanId
    : undefined;
  const moduleId = validateObjectId(req.body.moduleId)
    ? req.body.moduleId
    : undefined;
  const module = validateAndReturnUserGeneratedModule(req.body.module);

  if (!studyPlanId || !semesterPlanId || !module || !moduleId) {
    return next(new BadRequestError("Ungültige Inputs"));
  }

  try {
    const studyPlan = await StudyPlan.findOne(
      {
        _id: studyPlanId,
        "semesterPlans._id": semesterPlanId,
        "semesterPlans.userGeneratedModules._id": moduleId,
      },
      { "semesterPlans.$": 1 }
    );

    if (!studyPlan) {
      return next(new NotFoundError("Studienplan wurde nicht gefunden."));
    }

    const semesterPlan = studyPlan.semesterPlans.find(
      (el: SemesterPlan) => el._id.toString() === semesterPlanId
    );

    if (!semesterPlan) {
      return next(new NotFoundError("Semesterplan wurde nicht gefunden."));
    }

    const moduleToUpdate = semesterPlan.userGeneratedModules.find(
      (el: UserGeneratedModule) => el._id.toString() === moduleId
    );

    if (!moduleToUpdate) {
      return next(new NotFoundError("Modul wurde nicht gefunden."));
    }

    const newSummedEcts =
      semesterPlan.summedEcts - moduleToUpdate.ects + module.ects;
    const updatedStudyPlan = await StudyPlan.findOneAndUpdate(
      {
        _id: studyPlanId,
        "semesterPlans._id": semesterPlanId,
        "semesterPlans.userGeneratedModules._id": moduleId,
      },
      {
        $set: {
          "semesterPlans.$[semesterPlan].userGeneratedModules.$[module].ects":
            module.ects,
          "semesterPlans.$[semesterPlan].userGeneratedModules.$[module].name":
            module.name,
          "semesterPlans.$[semesterPlan].userGeneratedModules.$[module].notes":
            module.notes,
          "semesterPlans.$[semesterPlan].summedEcts": newSummedEcts,
        },
      },
      {
        new: true,
        arrayFilters: [
          { "semesterPlan._id": semesterPlanId },
          { "module._id": moduleId },
        ],
        runValidators: true,
      }
    );

    if (!updatedStudyPlan) {
      return next(
        new NotFoundError("Semesterplan wurde im Studienplan nicht gefunden.")
      );
    }

    const updatedSemesterPlan = updatedStudyPlan.semesterPlans.find(
      (el: SemesterPlan) => el._id.toString() === semesterPlanId
    );

    const updatedModule = updatedSemesterPlan?.userGeneratedModules.find(
      (el: UserGeneratedModule) => el._id.toString() === moduleId
    );

    res.status(200).json(updatedModule);
  } catch (error) {
    next(error);
  }
}

export async function initSemesterPlans(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id =
    typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
  const semesterPlans: SemesterPlanTemplate[] = req.body.semesterPlans;
  const studyPlan = await findStudyPlan(id);
  const user = req.user as UserServer;
  if (Array.isArray(semesterPlans) && studyPlan && user) {
    for (let semesterPlan of semesterPlans) {
      // check if userId is set correctly otherwise set it
      semesterPlan.userId = semesterPlan.userId ? semesterPlan.userId : user._id;

      const validatedSemesterPlan = validateAndReturnSemesterPlan(semesterPlan);
      if (validatedSemesterPlan) {
        studyPlan.semesterPlans.push(validatedSemesterPlan);
      }
    }
    await studyPlan.save();
    res.status(200).json(studyPlan.semesterPlans);
  } else {
    next(new BadRequestError());
  }
}

export async function addSemesterPlanToStudyPlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  const spId =
    typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
  const semester = validator.matches(req.body.semester, /\d{4}((w)|(s))/g)
    ? req.body.semester
    : undefined;
  if (spId && user._id && semester) {
    const studyPlan = await findStudyPlan(spId);
    if (studyPlan) {
      try {
        const newSemesterPlan: any = {
          modules: [],
          userGeneratedModules: [],
          courses: [],
          userId: user._id,
          semester: semester,
          isPastSemester: false,
          aimedEcts: 0,
          summedEcts: 0,
        };
        studyPlan.semesterPlans.push(newSemesterPlan);
        await studyPlan.save();
        res.status(200).json(studyPlan);
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

export async function updateSemesterPlanAimedEcts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const spId =
    typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
  const semesterPlanId = validateObjectId(req.body.semesterPlanId)
    ? req.body.semesterPlanId
    : undefined;
  const aimedEcts =
    req.body.aimedEcts &&
    validator.isInt(String(req.body.aimedEcts), { min: 0, max: 210 })
      ? Number(req.body.aimedEcts)
      : undefined;

  const studyPlan = await findStudyPlan(spId);

  if (studyPlan && semesterPlanId && aimedEcts) {
    const semesterPlan = studyPlan.semesterPlans.find(
      (el: SemesterPlan) => el._id == semesterPlanId
    );
    if (semesterPlan && semesterPlan.aimedEcts !== undefined) {
      semesterPlan.aimedEcts = aimedEcts;
      await studyPlan.save();
      res.status(200).json(semesterPlan);
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
    typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
  const semesterPlanId = validateObjectId(req.body.semesterPlanId)
    ? req.body.semesterPlanId
    : undefined;
  const isPast = Boolean(req.body.isPast);

  const studyPlan = await findStudyPlan(spId);

  if (studyPlan && semesterPlanId && isPast) {
    const semesterPlan = studyPlan.semesterPlans.find(
      (el: SemesterPlan) => el._id == semesterPlanId
    );

    if (semesterPlan) {
      try {
        semesterPlan.isPastSemester = isPast;

        await studyPlan.save();
        res.status(200).json(semesterPlan);
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
  const studyPlanId =
    typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
  const semesterPlanId = validateObjectId(req.body.semesterPlanId)
    ? req.body.semesterPlanId
    : undefined;
  const mod = typeof req.body.module == "string" ? req.body.module : undefined;
  const ects = !Number.isNaN(Number(req.body.ects))
    ? Number(req.body.ects)
    : undefined;

  const studyPlan = await findStudyPlan(studyPlanId);

  if (studyPlan && semesterPlanId && mod && ects) {
    const semesterPlan = studyPlan.semesterPlans.find(
      (el: SemesterPlan) => el._id == semesterPlanId
    );
    if (semesterPlan) {
      const index = semesterPlan.modules.findIndex((el: String) => el == mod);
      if (index !== -1) {
        const deleted = semesterPlan.modules.splice(index, 1);
        semesterPlan.summedEcts -= ects;
        // TODO: Hier tritt ein Fehler auf, wenn man ein Modul zwischen Semestern hin und her verschiebt, vermutlich weil das Hinzufügen und Löschen beide auf den study plan zugreifen.
        await studyPlan.save();
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
  const studyPlanId =
    typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
  const semesterPlanId = validateObjectId(req.body.semesterPlanId)
    ? req.body.semesterPlanId
    : undefined;
  const module = validateAndReturnUserGeneratedModule(req.body.module);

  const studyPlan = await findStudyPlan(studyPlanId);

  if (studyPlan && semesterPlanId && module) {
    const semesterPlan = studyPlan.semesterPlans.find(
      (el: SemesterPlan) => el._id == semesterPlanId
    );
    if (semesterPlan && semesterPlan.userGeneratedModules) {
      const index = semesterPlan.userGeneratedModules.findIndex(
        (el: UserGeneratedModule) => el._id == module._id
      );
      if (index !== -1) {
        const deleted = semesterPlan.userGeneratedModules.splice(index, 1);

        semesterPlan.summedEcts -= module.ects;
        await studyPlan.save();
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
  const studyPlanId =
    typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
  const semesterPlanId = validateObjectId(req.body.semesterPlanId)
    ? req.body.semesterPlanId
    : undefined;
  const moduleIds: string[] = Array.isArray(req.body.moduleIds)
    ? req.body.moduleIds
    : [];

  const studyPlan = await findStudyPlan(studyPlanId);

  if (studyPlan && semesterPlanId && moduleIds.length > 0) {
    const semesterPlan = studyPlan.semesterPlans.find(
      (el: SemesterPlan) => el._id == semesterPlanId
    );

    if (semesterPlan && semesterPlan.userGeneratedModules) {
      const deletedModules: UserGeneratedModule[] = [];
      moduleIds.forEach((moduleId) => {
        const index = semesterPlan.userGeneratedModules.findIndex(
          (el: UserGeneratedModule) => el._id == moduleId
        );
        if (index !== -1) {
          const [deleted] = semesterPlan.userGeneratedModules.splice(index, 1);
          semesterPlan.summedEcts -= deleted.ects;
          deletedModules.push(deleted);
        }
      });

      if (deletedModules.length > 0) {
        await studyPlan.save();
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

// add course to semester plan
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
    const studyPlan = await findActiveStudyPlan(user._id);
    if (studyPlan) {
      // find semester plan
      const semesterPlan = studyPlan.semesterPlans.find(
        (el) => el.semester === semester
      );
      if (semesterPlan && semesterPlan.courses) {
        semesterPlan.courses.push(course);
        semesterPlan.isPastSemester = isPastSemester;
        try {
          await studyPlan.save();
          res.status(200).json(semesterPlan.courses);
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

// delete course from semester plan
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
    const studyPlan = await findActiveStudyPlan(user._id);
    if (studyPlan) {
      // find semester plan
      const semplan = studyPlan.semesterPlans.find(
        (el) => el.semester === semester
      );
      if (semplan) {
        const index = semplan.courses.findIndex((el) => el.id == courseId);
        semplan.courses.splice(index, 1);
        try {
          await studyPlan.save();
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

// Add multiple courses to semester plan
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
    const studyPlan = await findActiveStudyPlan(user._id);
    if (studyPlan) {
      const semplan = studyPlan.semesterPlans.find(
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
          await studyPlan.save();
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

// Remove multiple courses from semester plan
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
    const studyPlan = await findActiveStudyPlan(user._id);
    if (studyPlan) {
      const semplan = studyPlan.semesterPlans.find(
        (el) => el.semester === semester
      );
      if (semplan && semplan.courses) {
        semplan.courses = semplan.courses.filter(
          (course) => !courseIds.includes(course.id)
        );
        try {
          await studyPlan.save();
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

export async function importSemesterPlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const semester = validator.matches(req.body.semester, /\d{4}((w)|(s))/g)
    ? req.body.semester
    : undefined;
  const newSemesterPlan = validateAndReturnSemesterPlanTemplate(
    req.body.semesterPlan
  );
  const user = req.user as UserServer;

  if (semester && newSemesterPlan && user._id) {
    try {
      const studyPlan = await findActiveStudyPlan(user._id);
      if (studyPlan) {
        const existingSemesterPlan = studyPlan.semesterPlans.find(
          (el) => el.semester === semester
        );

        if (existingSemesterPlan) {
          existingSemesterPlan.isPastSemester = newSemesterPlan.isPastSemester;
          existingSemesterPlan.courses = newSemesterPlan.courses;
          await studyPlan.save();
          res.json(existingSemesterPlan);
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