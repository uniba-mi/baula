import { NextFunction, Request, Response } from "express";
import { Studyplan } from "../../database/mongo";
import {
  validateObjectId,
  validateAndReturnStudyplan,
  validateAndReturnUserGeneratedModule,
} from "../../shared/helpers/customValidator";
import { BadRequestError, NotFoundError } from "../../shared/error";
import validator from "validator";
import fs from "fs/promises";
import path from "path";
import { Semester } from "../../../../../interfaces/semester";
import { UserGeneratedModule } from "../../usergeneratedmodule";
import { UserServer } from "../../user";

// GET REQUESTS
export async function getAllStudyplansOfUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  try {
    const result = await Studyplan.find({ userId: user._id }).exec();
    if (result) {
      res.status(200).json(result);
    } else {
      next(new NotFoundError("Es konnten keine Studienpläne gefunden werden!"));
    }
  } catch (error) {
    next(new BadRequestError());
  }
}

export async function checkStudyplanTemplateAvailability(
  req: Request,
  res: Response
) {
  const programId = validator.isAlphanumeric(req.params.programId, undefined)
    ? req.params.programId
    : undefined;
  const semesterType = ["w", "s"].includes(req.params.semesterType)
    ? (req.params.semesterType as "w" | "s")
    : undefined;

  try {
    if (programId && semesterType) {
      const directoryPath = path.join(
        __dirname,
        "../../../staticdata/studyplan_templates"
      );
      const files = await fs.readdir(directoryPath);

      // Filter files by programId
      const relevantFiles = files.filter((file) => file.includes(programId));

      if (relevantFiles.length !== 0) {
        // Find the latest plan based on the semester type
        const latestPlanFile = getLatestPlanFilename(
          relevantFiles,
          semesterType
        );

        if (latestPlanFile) {
          return res.status(200).json({ available: true });
        }
      }
    }
    // If no template is found, return a response indicating it's not available
    return res.status(200).json({ available: false });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ available: false });
  }
}

export async function getLatestTemplateForStudyProgram(
  req: Request,
  res: Response
) {
  const programId = validator.isAlphanumeric(req.params.programId, undefined)
    ? req.params.programId
    : undefined;
  const semesterType = ["w", "s"].includes(req.params.semesterType)
    ? (req.params.semesterType as "w" | "s")
    : undefined;

  try {
    if (programId && semesterType) {
      const directoryPath = path.join(
        __dirname,
        "../../../staticdata/studyplan_templates"
      );
      const files = await fs.readdir(directoryPath);

      // Filter files by programId
      const relevantFiles = files.filter((file) => file.includes(programId));

      if (relevantFiles.length !== 0) {
        // Find the latest plan based on the semester type
        const latestPlanFile = getLatestPlanFilename(
          relevantFiles,
          semesterType
        );

        if (latestPlanFile) {
          // Read and parse the latest JSON file
          const filePath = path.join(directoryPath, latestPlanFile);
          const fileContent = await fs.readFile(filePath, "utf-8");
          const studyplan = JSON.parse(fileContent);

          // Send the parsed JSON content as a response
          return res.status(200).json(studyplan);
        }
      }
    }
    // If no template is found, return a 404 status
    return res.status(404).send("Musterstudienverlaufsplan nicht gefunden.");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Fehler beim Abrufen des Studienplans.");
  }
}

export async function getActiveStudyplan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  try {
    const result = await Studyplan.findOne({ userId: user._id, status: true });
    if (result) {
      res.status(200).json(result);
    } else {
      next(
        new NotFoundError("Es konnte kein aktiver Studienplan gefunden werden!")
      );
    }
  } catch (error) {
    next(new BadRequestError());
  }
}

// CREATE REQUESTS
export async function createStudyplan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplan = validateAndReturnStudyplan(req.body.studyplan);
  const user = req.user as UserServer;

  try {
    // check user and if input is of type studyplan
    if (user && studyplan) {
      // check if user id is set in semesterplans to prevent errors
      for(let plan of studyplan.semesterPlans) {
        if(!plan.userId) {
          plan.userId = user._id
        }
      }

      // create new studyplan
      const createdStudyplan = await Studyplan.create({
        name: studyplan.name,
        status: studyplan.status,
        semesterPlans: studyplan.semesterPlans,
        userId: user._id,
      });
      if (createdStudyplan) {
        res.status(200).json(createdStudyplan);
      } else {
        next(
          new NotFoundError("Es konnte kein valider Studienplan angelegt werden.")
        );
      }
    } else {
      next(new BadRequestError("Die Eingaben sind fehlerhaft."));
    }
  } catch (error) {
    next(new BadRequestError());
  }
}

// UPDATE REQUESTS
export async function updateStudyplan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplanId = validateObjectId(req.body.studyplanId)
    ? req.body.studyplanId
    : undefined;
  const studyplan = validateAndReturnStudyplan(req.body.studyplan);
  const user = req.user as UserServer;

  if (studyplanId && studyplan && user._id) {
    try {
      const result = await Studyplan.updateOne(
        { _id: studyplanId, userId: user._id },
        {
          name: studyplan.name,
          status: studyplan.status,
          semesterPlans: studyplan.semesterPlans,
        }
      );
      res.status(200).json(result);
    } catch (error) {
      next(
        new NotFoundError(
          "Zu den angegebenen Daten wurde kein Eintrag gefunden."
        )
      );
    }
  } else {
    next(new BadRequestError());
  }
}

// add modules to the current semester of all study plans of a user
export async function addModulesToCurrentSemesterOfAllStudyplans(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  const modules: UserGeneratedModule[] = Array.isArray(req.body.modules)
    ? req.body.modules
    : [];
  const semesterName: string = req.body.semesterName;

  if (!user._id || !semesterName || modules.length === 0) {
    return next(new BadRequestError("Ungültige Parameter"));
  }

  try {
    const studyplans = await Studyplan.find({ userId: user._id }).exec();

    if (studyplans.length > 0) {

      // iterate over studyplans and find current semester plan
      for (const studyplan of studyplans) {
        const currentSemesterPlan = studyplan.semesterPlans.find(
          (semesterPlan) => semesterPlan.semester === semesterName
        );

        if (currentSemesterPlan) {
          // add modules to current semester
          modules.forEach((module: UserGeneratedModule) => {
            const moduleExistsInUserGeneratedModules = currentSemesterPlan.userGeneratedModules.some(
              (existingModule) => existingModule.acronym === module.acronym
            );
            const moduleExistsInModules = currentSemesterPlan.modules.includes(module.acronym);
            // new modules is only added if it is neither in usergenerated modules nor in "normal" modules
            if (!moduleExistsInUserGeneratedModules && !moduleExistsInModules) {
              const newModule = {
                ...module,
                flexNowImported: module.flexNowImported ?? true,
              };
              currentSemesterPlan.userGeneratedModules.push(newModule);
              currentSemesterPlan.summedEcts += module.ects;
            }
          });

          studyplan.markModified('semesterPlans');

          await studyplan.save();
        }
      }
    }
    return res.status(200).json(studyplans);
  } catch (err) {
    next(err);
  }
}

export async function transferModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplanId = validateObjectId(req.body.studyplanId)
    ? req.body.studyplanId
    : undefined;
  const oldSemesterplanId = validateObjectId(req.body.oldSemesterplanId)
    ? req.body.oldSemesterplanId
    : undefined;
  const newSemesterplanId = validateObjectId(req.body.newSemesterPlanId)
    ? req.body.newSemesterPlanId
    : undefined;
  const acronym = validator.isAlphanumeric(req.body.acronym, "de-DE", {
    ignore: "-",
  })
    ? req.body.acronym
    : undefined;
  const ects = !Number.isNaN(Number(req.body.ects)) ? Number(req.body.ects) : 0;

  if (studyplanId && oldSemesterplanId && newSemesterplanId && acronym) {
    try {
      const studyplan = await Studyplan.findById(studyplanId);
      if (studyplan) {
        const oldSemesterplan = studyplan.semesterPlans.find(
          (el) => el._id.toString() === oldSemesterplanId
        );
        const newSemesterplan = studyplan.semesterPlans.find(
          (el) => el._id.toString() === newSemesterplanId
        );
        if (oldSemesterplan && newSemesterplan) {
          // delete module from oldSemesterplan and add to newSemesterplan
          oldSemesterplan.modules = oldSemesterplan.modules.filter(
            (el) => el !== acronym
          );
          oldSemesterplan.summedEcts -= ects;
          newSemesterplan.modules.push(acronym);
          newSemesterplan.summedEcts += ects;
          const result = await studyplan.save();
          if (result) {
            res.status(200).json({ oldSemesterplan, newSemesterplan });
          } else {
            next(new BadRequestError());
          }
        } else {
          next(new NotFoundError());
        }
      } else {
        next(new NotFoundError());
      }
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(new BadRequestError());
  }
}

export async function transferUserGeneratedModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplanId = validateObjectId(req.body.studyplanId)
    ? req.body.studyplanId
    : undefined;
  const oldSemesterplanId = validateObjectId(req.body.oldSemesterplanId)
    ? req.body.oldSemesterplanId
    : undefined;
  const newSemesterplanId = validateObjectId(req.body.newSemesterPlanId)
    ? req.body.newSemesterPlanId
    : undefined;
  const module = validateAndReturnUserGeneratedModule(req.body.module);

  if (studyplanId && oldSemesterplanId && newSemesterplanId && module) {
    try {
      const studyplan = await Studyplan.findById(studyplanId);
      if (studyplan) {
        const oldSemesterplan = studyplan.semesterPlans.find(
          (el) => el._id.toString() === oldSemesterplanId
        );
        const newSemesterplan = studyplan.semesterPlans.find(
          (el) => el._id.toString() === newSemesterplanId
        );
        if (oldSemesterplan && newSemesterplan) {
          // delete module from oldSemesterplan and add to newSemesterplan
          oldSemesterplan.userGeneratedModules =
            oldSemesterplan.userGeneratedModules.filter(
              (el) => el._id.toString() !== module._id
            );
          oldSemesterplan.summedEcts -= module.ects;
          newSemesterplan.userGeneratedModules.push(module);
          newSemesterplan.summedEcts += module.ects;
          const result = await studyplan.save();
          if (result) {
            res.status(200).json({ oldSemesterplan, newSemesterplan });
          } else {
            next(new BadRequestError());
          }
        } else {
          next(new NotFoundError());
        }
      } else {
        next(new NotFoundError());
      }
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(new BadRequestError());
  }
}

// DELETE REQUESTS
export async function deleteStudyplan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyplanId = validateObjectId(req.params.id)
    ? req.params.id
    : undefined;
  const user = req.user as UserServer;

  if (studyplanId && user._id) {
    try {
      const result = await Studyplan.deleteOne({
        _id: studyplanId,
        userId: user._id,
      });
      if (result.deletedCount !== 0) {
        res.status(200).json(result);
      } else {
        next(
          new NotFoundError(
            "Mit den angegebenen Daten konnte kein Studienplan gelöscht werden."
          )
        );
      }
    } catch (error) {
      next(error);
    }
  } else {
    next(new BadRequestError());
  }
}

// Helper function to get the latest plan filename based on semester type
function getLatestPlanFilename(
  files: string[],
  semesterType: "w" | "s"
): string | undefined {
  let latestPlanFilename: string | undefined;
  let latestSemester: Semester | undefined;

  files.forEach((file) => {
    const match = file.match(/_(\d{4})([sw])/);
    if (match) {
      const semesterName = `${match[1]}${match[2]}`;
      const semester = new Semester(semesterName);

      if (semester.type === semesterType) {
        if (
          !latestSemester ||
          semester.year > latestSemester.year ||
          (semester.year === latestSemester.year &&
            semester.type === latestSemester.type)
        ) {
          latestSemester = semester;
          latestPlanFilename = file;
        }
      }
    }
  });

  return latestPlanFilename;
}
