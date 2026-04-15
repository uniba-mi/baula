import {
  Department,
  Prisma,
  PrismaClient,
  StudyProgramme,
} from "@prisma/client";
import { logError } from "../error";
import { Person } from "@interfaces/person";
import { ModuleHandbook } from "@interfaces/module-handbook";
import {
  Changelog,
  ImportLogMessage,
  MergedChangelog,
} from "@interfaces/logs";

const prisma = new PrismaClient();

export async function upsertDeparmtents(
  departments: Department[],
): Promise<Changelog> {
  return new Promise(async (resolve, reject) => {
    const depChange: Changelog = {
      queried: departments.length,
      added: 0,
      updated: 0,
      deleted: 0,
      error: false,
      detailLog: [],
    };
    try {
      // reduce departments to unique values
      departments = departments.filter(
        (department, index, self) =>
          index === self.findIndex((d) => d.shortName === department.shortName),
      );
      // add departments to database otherwise check for update
      for (let department of departments) {
        const existingDep = await prisma.department.findFirst({
          where: {
            shortName: department.shortName,
          },
        });
        if (!existingDep) {
          await prisma.department.create({
            data: department,
          });
          depChange.added++;
          depChange.detailLog.push(`Added ${department.shortName}`);
        } else {
          // check for changes and update
          if (existingDep.name !== department.name) {
            await prisma.department.update({
              where: {
                shortName: department.shortName,
              },
              data: {
                name: department.name,
              },
            });
            depChange.updated++;
            depChange.detailLog.push(`Changed name of ${department.shortName}`);
          }
        }
      }
      resolve(depChange);
    } catch (error) {
      logError(error);
      depChange.error = true;
      depChange.detailLog.push(
        "ERROR - Fehler beim Hinzufügen der Einrichtungen",
      );
      resolve(depChange);
    }
  });
}

export async function upsertPersons(persons: Person[]): Promise<Changelog> {
  return new Promise(async (resolve, reject) => {
    const personsChange: Changelog = {
      queried: 0,
      added: 0,
      updated: 0,
      deleted: 0,
      error: false,
      detailLog: [],
    };
    try {
      persons = persons.filter(
        (person, index, self) =>
          index === self.findIndex((d) => d.pId === person.pId),
      );
      personsChange.queried = persons.length;

      for (let person of persons) {
        const existingPerson = await prisma.person.findUnique({
          where: {
            pId: person.pId,
          },
        });
        if (!existingPerson) {
          await prisma.person.create({
            data: person,
          });
          personsChange.added++;
          personsChange.detailLog.push(`Added Person with id ${person.pId}`);
        } else {
          // check for changes and update
          const changes = checkAndReturnChanges(person, existingPerson);
          if (changes.length > 0) {
            await prisma.person.update({
              where: { pId: person.pId },
              data: person,
            });

            personsChange.updated++;
            personsChange.detailLog.push(
              `Updated Person ${person.pId}: ${changes.join(", ")}`,
            );
          }
        }
      }
      resolve(personsChange);
    } catch (error) {
      logError(error);
      personsChange.error = true;
      personsChange.detailLog.push(
        "ERROR - Fehler beim Hinzufügen der Personen",
      );
      resolve(personsChange);
    }
  });
}

export async function upsertStudyprogrammes(
  sps: StudyProgramme[],
): Promise<Changelog> {
  return new Promise(async (resolve, reject) => {
    const spsChanges: Changelog = {
      queried: 0,
      added: 0,
      updated: 0,
      deleted: 0,
      error: false,
      detailLog: [],
    };
    try {
      sps = sps.filter(
        (programme, index, self) =>
          index ===
          self.findIndex(
            (d) =>
              d.spId === programme.spId && d.poVersion === programme.poVersion,
          ),
      );
      spsChanges.queried = sps.length;

      for (let programme of sps) {
        const existingSp = await prisma.studyProgramme.findUnique({
          where: {
            spId_poVersion: {
              spId: programme.spId,
              poVersion: programme.poVersion,
            },
          },
        });
        if (!existingSp) {
          await prisma.studyProgramme.create({
            data: programme,
          });
          spsChanges.added++;
          spsChanges.detailLog.push(
            `Added Study Programme with id ${programme.spId}`,
          );
        } else {
          // check for changes and update
          const changes = checkAndReturnChanges(programme, existingSp);
          if (changes.length > 0) {
            await prisma.studyProgramme.update({
              where: {
                spId_poVersion: {
                  spId: programme.spId,
                  poVersion: programme.poVersion,
                },
              },
              data: programme,
            });
            spsChanges.updated++;
            spsChanges.detailLog.push(
              `Updated Study Programme ${programme.spId}: ${changes.join(", ")}`,
            );
          }
        }
      }
      resolve(spsChanges);
    } catch (error) {
      logError(error);
      spsChanges.error = true;
      spsChanges.detailLog.push(
        "ERROR - Fehler beim Hinzufügen der Studiengänge",
      );
      resolve(spsChanges);
    }
  });
}

export async function upsertModuleHandbooks(
  mhbs: ModuleHandbook[],
): Promise<Changelog> {
  return new Promise(async (resolve, reject) => {
    const mhbsChanges: Changelog = {
      queried: 0,
      added: 0,
      updated: 0,
      deleted: 0,
      error: false,
      detailLog: [],
    };
    try {
      mhbs = mhbs.filter(
        (mhb, index, self) =>
          index ===
          self.findIndex(
            (d) => d.mhbId === mhb.mhbId && d.version === mhb.version,
          ),
      );
      mhbsChanges.queried = mhbs.length;

      for (let mhb of mhbs) {
        const existingMhb = await prisma.mhb.findUnique({
          where: {
            mhbId_version: {
              mhbId: mhb.mhbId,
              version: mhb.version,
            },
          },
        });
        if (!existingMhb) {
          await prisma.mhb.create({
            data: {
              mhbId: mhb.mhbId,
              version: mhb.version,
              name: mhb.name,
              desc: mhb.desc,
              semester: mhb.semester,
            },
          });
          mhbsChanges.added++;
          mhbsChanges.detailLog.push(
            `Added mhb with name: ${mhb.name} (${mhb.mhbId})`,
          );
        } else {
          // check for changes and update
          const changes = checkAndReturnChanges(mhb, existingMhb);
          if (changes.length > 0) {
            await prisma.mhb.update({
              where: {
                mhbId_version: {
                  mhbId: mhb.mhbId,
                  version: mhb.version,
                },
              },
              data: {
                name: mhb.name,
                desc: mhb.desc,
                semester: mhb.semester,
              },
            });
            mhbsChanges.updated++;
            mhbsChanges.detailLog.push(
              `Updated mhb ${mhb.mhbId}: ${changes.join(", ")}`,
            );
          }
        }
      }
      resolve(mhbsChanges);
    } catch (error) {
      logError(error);
      mhbsChanges.error = true;
      mhbsChanges.detailLog.push(
        "ERROR - Fehler beim Hinzufügen der Modulhandbücher",
      );
      resolve(mhbsChanges);
    }
  });
}

export async function upsertModuleGroups(
  mgs: Prisma.ModuleGroupCreateInput[],
): Promise<Changelog> {
  return new Promise(async (resolve, reject) => {
    const mgsChange: Changelog = {
      queried: 0,
      added: 0,
      updated: 0,
      deleted: 0,
      error: false,
      detailLog: [],
    };
    try {
      mgs = mgs.filter(
        (mg, index, self) =>
          index ===
          self.findIndex((d) => d.mgId === mg.mgId && d.version === mg.version),
      );
      mgsChange.queried = mgs.length;

      for (let mg of mgs) {
        // filter invalid values in mgs
        if (Number.isNaN(mg.ectsMin)) {
          mg.ectsMin = null;
        }
        if (Number.isNaN(mg.ectsMax)) {
          mg.ectsMax = null;
        }
        if (Number.isNaN(mg.order)) {
          mg.order = null;
        }
        // add modulegroups to database otherwise check for update
        const existingMg = await prisma.moduleGroup.findUnique({
          where: {
            mgId_version: {
              mgId: mg.mgId,
              version: mg.version,
            },
          },
        });
        if (!existingMg) {
          await prisma.moduleGroup.create({
            data: mg,
          });
          mgsChange.added++;
          mgsChange.detailLog.push(
            `Added Modulegroup with name: ${mg.name} (${mg.mgId})`,
          );
        } else {
          // check for changes and update
          const changes = checkAndReturnChanges(mg, existingMg);
          if (changes.length > 0) {
            await prisma.moduleGroup.update({
              where: {
                mgId_version: {
                  mgId: mg.mgId,
                  version: mg.version,
                },
              },
              data: mg,
            });
            mgsChange.updated++;
            mgsChange.detailLog.push(
              `Updated Module Group ${mg.mgId}: ${changes.join(", ")}`,
            );
          }
        }
      }
      resolve(mgsChange);
    } catch (error) {
      logError(error);
      mgsChange.error = true;
      mgsChange.detailLog.push(
        "ERROR - Fehler beim Hinzufügen der Modulgruppen",
      );
      resolve(mgsChange);
    }
  });
}

export async function upsertModules(modules: any[]): Promise<Changelog> {
  return new Promise(async (resolve, reject) => {
    const modulesChange: Changelog = {
      queried: 0,
      added: 0,
      updated: 0,
      deleted: 0,
      error: false,
      detailLog: [],
    };
    try {
      modules = modules.filter(
        (module, index, self) =>
          index ===
          self.findIndex(
            (d) => d.mId === module.mId && d.version === module.version,
          ),
      );
      modulesChange.queried = modules.length;

      for (let module of modules) {
        // convert workload from array to string
        if (module.workload) {
          let workloadString = "";
          for (let string of module.workload) {
            if (string.type && string.hours) {
              workloadString += `${string.type}: ${string.hours} Stunden\n`;
            } else {
              workloadString += `${string.hours} Stunden\n`;
            }
          }
          module.workload = workloadString;
        } else {
          module.workload = null;
        }
        // add modules to database otherwise check for update
        const existingModule = await prisma.module.findUnique({
          where: {
            mId_version: {
              mId: module.mId,
              version: module.version,
            },
          },
        });
        if (!existingModule) {
          await prisma.module.create({
            data: module,
          });
          modulesChange.added++;
          modulesChange.detailLog.push(
            `Added Module with name ${module.name} (${module.mId})`,
          );
        } else {
          // check for changes and update
          const changes = checkAndReturnChanges(module, existingModule);
          if (changes.length > 0) {
            await prisma.module.update({
              where: {
                mId_version: {
                  mId: module.mId,
                  version: module.version,
                },
              },
              data: module,
            });
            modulesChange.updated++;
            modulesChange.detailLog.push(
              `Updated Module ${module.mId}: ${changes.join(", ")}`,
            );
          }
        }
      }
      resolve(modulesChange);
    } catch (error) {
      logError(error);
      modulesChange.error = true;
      modulesChange.detailLog.push("ERROR - Fehler beim Hinzufügen der Module");
      resolve(modulesChange);
    }
  });
}

export async function upsertModuleExams(
  exams: Prisma.ModuleExamCreateInput[],
): Promise<Changelog> {
  return new Promise(async (resolve, reject) => {
    const examsChange: Changelog = {
      queried: 0,
      added: 0,
      updated: 0,
      deleted: 0,
      error: false,
      detailLog: [],
    };
    try {
      exams = exams.filter(
        (exam, index, self) =>
          index === self.findIndex((d) => d.meId === exam.meId),
      );
      examsChange.queried = exams.length;

      for (let exam of exams) {
        if (Number.isNaN(exam.duration)) {
          exam.duration = null;
        }
        // add exams to database otherwise check for update
        const existingExam = await prisma.moduleExam.findUnique({
          where: {
            meId: exam.meId,
          },
        });
        if (!existingExam) {
          await prisma.moduleExam.create({
            data: exam,
          });
          examsChange.added++;
          examsChange.detailLog.push(
            `Added module exam: ${exam.name} (${exam.meId})`,
          );
        } else {
          // check for changes and update
          const changes = checkAndReturnChanges(exam, existingExam);
          if (changes.length > 0) {
            await prisma.moduleExam.update({
              where: {
                meId: exam.meId,
              },
              data: exam,
            });
            examsChange.updated++;
            examsChange.detailLog.push(
              `Updated Exam ${exam.meId}: ${changes.join(", ")}`,
            );
          }
        }
      }
      resolve(examsChange);
    } catch (error) {
      logError(error);
      examsChange.error = true;
      examsChange.detailLog.push(
        "ERROR - Fehler beim Hinzufügen der Prüfungen",
      );
      resolve(examsChange);
    }
  });
}

export async function upsertModuleCourses(
  mcs: Prisma.ModuleCourseCreateInput[],
): Promise<Changelog> {
  return new Promise(async (resolve, reject) => {
    const mcsChange: Changelog = {
      queried: 0,
      added: 0,
      updated: 0,
      deleted: 0,
      error: false,
      detailLog: [],
    };
    try {
      mcs = mcs.filter(
        (mc, index, self) =>
          index === self.findIndex((d) => d.mcId === mc.mcId),
      );
      mcsChange.queried = mcs.length;

      for (let mc of mcs) {
        // filter invalid values in mcs
        if (Number.isNaN(mc.order)) {
          mc.order = null;
        }
        if (Number.isNaN(mc.ects)) {
          mc.ects = null;
        }
        if (Number.isNaN(mc.sws)) {
          mc.sws = null;
        }
        // add moduleCourses to database otherwise check for update
        const existingMc = await prisma.moduleCourse.findUnique({
          where: {
            mcId: mc.mcId,
          },
        });
        if (!existingMc) {
          await prisma.moduleCourse.create({
            data: mc,
          });
          mcsChange.added++;
          mcsChange.detailLog.push(
            `Added Module Course with name ${mc.name} (${mc.mcId})`,
          );
        } else {
          // check for changes and update
          const changes = checkAndReturnChanges(mc, existingMc);
          if (changes.length > 0) {
            await prisma.moduleCourse.update({
              where: {
                mcId: mc.mcId,
              },
              data: mc,
            });
            mcsChange.updated++;
            mcsChange.detailLog.push(
              `Updated Module Course ${mc.mcId}: ${changes.join(", ")}`,
            );
          }
        }
      }
      resolve(mcsChange);
    } catch (error) {
      logError(error);
      mcsChange.error = true;
      mcsChange.detailLog.push(
        "ERROR - Fehler beim Hinzufügen der Lehrveranstaltungen",
      );
      resolve(mcsChange);
    }
  });
}

function checkAndReturnChanges(newEntry: any, oldEntry: any) {
  const changes: string[] = [];

  for (const key of Object.keys(newEntry)) {
    if (newEntry[key] !== oldEntry[key] && 
      // additional conditions where comparison is not working
      key !== "prevModules" && 
      key !== "identifier") {
      changes.push(`${key}: '${oldEntry[key]}' -> '${newEntry[key]}'`);
    }
  }

  return changes;
}

/** Helper functions for Logging  */
function mergeChangelogs(logs: Changelog[]): Changelog {
  return logs.reduce<Changelog>(
    (acc, curr) => {
      acc.queried += curr.queried;
      acc.added += curr.added;
      acc.updated += curr.updated;
      acc.deleted += curr.deleted;
      acc.error = acc.error || curr.error;
      acc.detailLog.push(...curr.detailLog);
      return acc;
    },
    {
      queried: 0,
      added: 0,
      updated: 0,
      deleted: 0,
      error: false,
      detailLog: [],
    },
  );
}

export function generateLogging(logs: MergedChangelog[]): ImportLogMessage {
  let result: string[] = [];
  let detailLog: string[] = [];
  for (const key of Object.keys(logs[0])) {
    const keyLog = mergeChangelogs(logs.map((el) => el[key]));
    result.push(
      `${key}: ${keyLog.queried} queried, ${keyLog.added} added, ${keyLog.updated} updated, ${keyLog.deleted} deleted ${keyLog.error ? ", ERROR OCCURED, see detailed Log!" : ""} `,
    );
    detailLog = detailLog.concat(keyLog.detailLog);
  }

  return {
    logs: result,
    detailLog
  };
}
