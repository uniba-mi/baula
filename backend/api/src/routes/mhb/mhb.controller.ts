import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Module } from "../../../../../interfaces/module";
import validator from "validator";
import { BadRequestError, NotFoundError } from "../../shared/error";
import { moduleChanges } from "../../shared/moduleMapping";
import { addAllPriorModules, addExtractedModules, addModuleCourses, findAndBuildModulehandbookByIdAndVersion } from "../../shared/moduleHelpers";

const prisma = new PrismaClient();

// Get mhb-structure from specific id
export async function getMhbByIdAndVersion(req: Request, res: Response, next: NextFunction) {
  const mhbId = validator.isAlphanumeric(req.params.id, undefined, { ignore: '_-' }) ? req.params.id : undefined;
  const version = validator.isInt(req.params.version)
    ? parseInt(req.params.version)
    : undefined;
  if (mhbId && version) {
    const mhb = await findAndBuildModulehandbookByIdAndVersion(mhbId, version);
    if(mhb) {
      res.status(200).json(mhb);
    } else {
      next(new NotFoundError("Zu den übergebenen Daten wurde kein Modulhandbuch gefunden!"));
    }
  } else {
    next(new BadRequestError("Fehlerhafte Daten übergeben!"))
  }
}

// get module by acronym and version
export async function getModByAcronymAndVersion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const acronym = validator.isAlphanumeric(req.params.acronym, 'de-DE', { ignore: '-' }) ? req.params.acronym : undefined;
  const version = validator.isInt(req.params.version)
    ? parseInt(req.params.version)
    : undefined;

  let select = {
    mId: true,
    version: true,
    acronym: true,
    name: true,
    content: true,
    skills: true,
    addInfo: true,
    priorKnowledge: true,
    ects: true,
    term: true,
    recTerm: true,
    duration: true,
    chair: true,
    respPerson: true,
    prevModules: true,
    exams: true,
    offerBegin: true,
    offerEnd: true,
    workload: true,
  }


  if (acronym) {
    let module;
    if (version) {
      module = await prisma.module.findFirst({
        select,
        where: {
          version,
          acronym,
        }
      })
    } else {
      module = await prisma.module.findFirst({
        select,
        where: {
          acronym
        }
      })
    }

    let modules: Module[] = [];
    if (module) {
      modules.push(
        new Module(
          module.mId,
          module.version,
          module.acronym,
          module.name,
          module.content,
          module.skills,
          module.addInfo,
          module.priorKnowledge,
          module.ects,
          module.term,
          module.recTerm,
          module.duration,
          module.chair,
          module.respPerson,
          module.exams,
          module.prevModules,
          module.offerBegin,
          module.offerEnd,
          module.workload
        )
      );
      await addModuleCourses(modules);
      await addExtractedModules(modules);
      await addAllPriorModules(modules);
      res.status(200).json(modules[0]);
    } else {
      next(new NotFoundError(
        "Zur übergebenen ID und Version wurde kein Modul gefunden!"
      ));
    }

  } else {
    next(new BadRequestError());
  }
}

export async function getAllModules(req: Request, res: Response, next: NextFunction) {
  prisma.module
    .findMany({
      include: {
        mCourses: {
          include: {
            mCourse: {
              select: {
                mcId: true,
                name: true,
                type: true,
              }
            }
          }
        }
      }
    })
    .then((mod) => {
      if (mod.length !== 0) {
        const result = mod.map(module => {
          return {
            ...module,
            mCourses: module.mCourses.map(mCourse => mCourse.mCourse)
          }
        })
        res.status(200).json(result);
      } else {
        next(new NotFoundError(
          "Zur übergebenen ID und Version wurde kein Modul gefunden!"
        ));
      }
    })
    .catch(() => {
      next(new BadRequestError());
    });
}

export async function getAllCurrentModules(req: Request, res: Response, next: NextFunction) {
  prisma.module.findMany()
    .then((modules) => {
      if (modules.length !== 0) {
        const updatedModules = mapOldModuleToEquivalentModules(modules.map(module => module.acronym));
        const result = modules.filter(module => updatedModules.includes(module.acronym));

        res.status(200).json(result);
      } else {
        next(new NotFoundError(
          "Zur übergebenen ID und Version wurde kein Modul gefunden!"
        ));
      }
    })
    .catch(() => {
      next(new BadRequestError());
    });
}

// helper
function mapOldModuleToEquivalentModules(modules: string[]): string[] {
  return modules.map(moduleAcronym => {
    const change = moduleChanges.find(change => change.oldModuleAcronym === moduleAcronym);
    return change ? change.newModuleAcronym : moduleAcronym;
  });
}