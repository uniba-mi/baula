import { NextFunction, Request, Response } from "express";
import { StudyPlan } from "../../../database/mongo";
import {
  validateObjectId,
  validateAndReturnStudyPlan,
  validateAndReturnUserGeneratedModule,
} from "../../../shared/helpers/custom-validator";
import { BadRequestError, NotFoundError } from "../../../shared/error";
import validator from "validator";
import fs from "fs/promises";
import path from "path";
import { UserGeneratedModule } from "../../../../../../interfaces/user-generated-module";
import { UserServer } from "../../../../../../interfaces/user";
import { getLatestPlanFilename } from "../../../shared/helpers/plan-helper";

// GET REQUESTS
export async function getAllStudyPlansOfUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  try {
    const result = await StudyPlan.find({ userId: user._id }).exec();
    if (result) {
      res.status(200).json(result);
    } else {
      next(new NotFoundError("Es konnten keine Studienpläne gefunden werden!"));
    }
  } catch (error) {
    next(new BadRequestError());
  }
}

export async function checkStudyPlanTemplateAvailability(
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
        "../../../../staticdata/studyplan-templates"
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
        "../../../../staticdata/studyplan-templates"
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
          const studyPlan = JSON.parse(fileContent);

          // Send the parsed JSON content as a response
          return res.status(200).json(studyPlan);
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

export async function getActiveStudyPlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  try {
    const result = await StudyPlan.findOne({ userId: user._id, status: true });
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
export async function createStudyPlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyPlan = validateAndReturnStudyPlan(req.body.studyPlan);
  const user = req.user as UserServer;

  try {
    // check user and if input is of type studyPlan
    if (user && studyPlan) {
      // check if user id is set in semester plans to prevent errors
      for(let plan of studyPlan.semesterPlans) {
        if(!plan.userId) {
          plan.userId = user._id
        }
      }

      // create new studyPlan
      const createdStudyplan = await StudyPlan.create({
        name: studyPlan.name,
        status: studyPlan.status,
        semesterPlans: studyPlan.semesterPlans,
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
export async function updateStudyPlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyPlanId = validateObjectId(req.body.studyPlanId)
    ? req.body.studyPlanId
    : undefined;
  const studyPlan = validateAndReturnStudyPlan(req.body.studyPlan);
  const user = req.user as UserServer;

  if (studyPlanId && studyPlan && user._id) {
    try {
      const result = await StudyPlan.updateOne(
        { _id: studyPlanId, userId: user._id },
        {
          name: studyPlan.name,
          status: studyPlan.status,
          semesterPlans: studyPlan.semesterPlans,
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
export async function addModulesToCurrentSemesterOfAllStudyPlans(
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
    const studyPlans = await StudyPlan.find({ userId: user._id }).exec();

    if (studyPlans.length > 0) {

      // iterate over study plans and find current semester plan
      for (const studyPlan of studyPlans) {
        const currentSemesterPlan = studyPlan.semesterPlans.find(
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

          studyPlan.markModified('semesterPlans');

          await studyPlan.save();
        }
      }
    }
    return res.status(200).json(studyPlans);
  } catch (err) {
    next(err);
  }
}

export async function transferModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyPlanId = validateObjectId(req.body.studyPlanId)
    ? req.body.studyPlanId
    : undefined;
  const oldSemesterPlanId = validateObjectId(req.body.oldSemesterPlanId)
    ? req.body.oldSemesterPlanId
    : undefined;
  const newSemesterPlanId = validateObjectId(req.body.newSemesterPlanId)
    ? req.body.newSemesterPlanId
    : undefined;
  const acronym = validator.isAlphanumeric(req.body.acronym, "de-DE", {
    ignore: "-",
  })
    ? req.body.acronym
    : undefined;
  const ects = !Number.isNaN(Number(req.body.ects)) ? Number(req.body.ects) : 0;

  if (studyPlanId && oldSemesterPlanId && newSemesterPlanId && acronym) {
    try {
      const studyPlan = await StudyPlan.findById(studyPlanId);
      if (studyPlan) {
        const oldSemesterPlan = studyPlan.semesterPlans.find(
          (el) => el._id.toString() === oldSemesterPlanId
        );
        const newSemesterPlan = studyPlan.semesterPlans.find(
          (el) => el._id.toString() === newSemesterPlanId
        );
        if (oldSemesterPlan && newSemesterPlan) {
          // delete module from oldSemesterPlan and add to newSemesterPlan
          oldSemesterPlan.modules = oldSemesterPlan.modules.filter(
            (el) => el !== acronym
          );
          oldSemesterPlan.summedEcts -= ects;
          newSemesterPlan.modules.push(acronym);
          newSemesterPlan.summedEcts += ects;
          const result = await studyPlan.save();
          if (result) {
            res.status(200).json({ oldSemesterPlan, newSemesterPlan });
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
  const studyPlanId = validateObjectId(req.body.studyPlanId)
    ? req.body.studyPlanId
    : undefined;
  const oldSemesterPlanId = validateObjectId(req.body.oldSemesterPlanId)
    ? req.body.oldSemesterPlanId
    : undefined;
  const newSemesterPlanId = validateObjectId(req.body.newSemesterPlanId)
    ? req.body.newSemesterPlanId
    : undefined;
  const module = validateAndReturnUserGeneratedModule(req.body.module);

  if (studyPlanId && oldSemesterPlanId && newSemesterPlanId && module) {
    try {
      const studyPlan = await StudyPlan.findById(studyPlanId);
      if (studyPlan) {
        const oldSemesterPlan = studyPlan.semesterPlans.find(
          (el) => el._id.toString() === oldSemesterPlanId
        );
        const newSemesterPlan = studyPlan.semesterPlans.find(
          (el) => el._id.toString() === newSemesterPlanId
        );
        if (oldSemesterPlan && newSemesterPlan) {
          // delete module from oldSemesterPlan and add to newSemesterPlan
          oldSemesterPlan.userGeneratedModules =
            oldSemesterPlan.userGeneratedModules.filter(
              (el) => el._id.toString() !== module._id
            );
          oldSemesterPlan.summedEcts -= module.ects;
          newSemesterPlan.userGeneratedModules.push(module);
          newSemesterPlan.summedEcts += module.ects;
          const result = await studyPlan.save();
          if (result) {
            res.status(200).json({ oldSemesterPlan, newSemesterPlan });
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
export async function deleteStudyPlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studyPlanId = validateObjectId(req.params.id)
    ? req.params.id
    : undefined;
  const user = req.user as UserServer;

  if (studyPlanId && user._id) {
    try {
      const result = await StudyPlan.deleteOne({
        _id: studyPlanId,
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