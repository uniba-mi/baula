import { Course, Term, UnivISCourse } from "../../../../../interfaces/course";
import { Prisma, PrismaClient } from "@prisma/client";
import { Room } from "../../../../../interfaces/room";
import { Person } from "../../../../../interfaces/person";
import { CompetenceFulfillment } from "../../../../../interfaces/competence";
import { CompetenceReader } from "./competence-reader";
import validator from "validator";

const prisma = new PrismaClient();

export function transformUnivISCourse(
  univisCourse: UnivISCourse,
  semester: string
): Course {
  let course = {
    id: univisCourse.id,
    name: univisCourse.name,
    short: univisCourse.short,
    organizational: univisCourse.organizational,
    desc: univisCourse.desc,
    literature: univisCourse.literature,
    addInfo: extractAddInfo(univisCourse),
    orgname:
      typeof univisCourse.orgname == "string"
        ? univisCourse.orgname.replace(/ +(?= )/g, "")
        : "",
    chair: univisCourse.chair,
    type: transformType(univisCourse.type),
    semester,
    ects: Number.isNaN(univisCourse.ects) ? null : univisCourse.ects,
    sws: Number.isNaN(univisCourse.sws) ? null : univisCourse.sws,
    keywords: univisCourse.keywords,
    lang: univisCourse.lang,
    expAttendance: Number.isNaN(univisCourse.expAttendance)
      ? null
      : univisCourse.expAttendance,
    format: univisCourse.format,
    nameEn: univisCourse.nameEn,
    literatureEn: univisCourse.literatureEn,
    organizationalEn: univisCourse.organizationalEn,
    descEn: univisCourse.descEn,
    lastUpdated: new Date().toISOString(),
    dozs: transformDozs(univisCourse.dozs),
    terms: transformTerms(univisCourse.terms),
    competence: [],
  };
  return course;
}

export function transformCourses(courses: any[]): Course[] {
  // currently only transforms dozs in courses
  let resultCourses: Course[] = [];
  for (let course of courses) {
    resultCourses.push({
      ...course,
      dozs: transformDozs(course.dozs),
    });
  }
  return resultCourses;
}

function extractAddInfo(course: UnivISCourse): string | null {
  let result: string[] = [];
  // transform additional parameters to addInfo-string
  if (course.benschein) {
    result.push("benoteter Schein");
  }
  if (course.schein) {
    result.push("Schein");
  }
  if (course.entre) {
    result.push("Entrepreneurship und Existenzgründung");
  }
  if (course.erwei) {
    result.push("Erweiterungsbereich");
  }
  if (course.frueh) {
    result.push("Frühstudium");
  }
  if (course.gasth) {
    result.push("Gaststudierendenverzeichnis");
  }
  if (course.generale) {
    result.push("Studium Generale");
  }
  if (course.kultur) {
    result.push("Kultur und Bildung");
  }
  if (course.modulstud) {
    result.push("Modulstudium");
  }
  if (course.nach) {
    result.push("Nachhaltigkeit");
  }
  if (course.spracha) {
    result.push("Sprachangebot");
  }
  if (course.womspe) {
    result.push("Gender und Diversität");
  }
  if (course.zemas) {
    result.push("Zentrum für Mittelalterstudien");
  }
  if (course.zenis) {
    result.push("Zentrum für Interreligiöse Studien");
  }

  return result.length != 0 ? result.join("; ") : null;
}

export function addCourse(entry: Course) {
  // remove invalid NaNs
  entry.ects = Number.isNaN(entry.ects) ? undefined : entry.ects;
  entry.sws = Number.isNaN(entry.sws) ? undefined : entry.sws;
  entry.expAttendance = Number.isNaN(entry.expAttendance)
    ? undefined
    : entry.expAttendance;

  return prisma.course.create({
    data: {
      id: entry.id,
      name: entry.name,
      short: entry.short,
      organizational: entry.organizational,
      desc: entry.desc,
      literature: entry.literature,
      addInfo: entry.addInfo,
      orgname: entry.orgname,
      chair: entry.chair,
      type: entry.type,
      ects: entry.ects,
      sws: entry.sws,
      keywords: entry.keywords,
      lang: entry.lang,
      expAttendance: entry.expAttendance,
      format: entry.format,
      nameEn: entry.nameEn,
      literatureEn: entry.literatureEn,
      organizationalEn: entry.organizationalEn,
      descEn: entry.descEn,
      lastUpdated: entry.lastUpdated,
      terms: {
        createMany: {
          data: entry.terms,
        },
      },
      semester: entry.semester,
    },
  });
}

function transformType(type: string): string {
  // some types are concated with / -> split and set type to first type
  const types = type.split("/");
  let newType = []
  for(let type of types) {
    newType.push(confertType(type))
  }
  return newType.join(' und ')
}

function confertType(type: string): string {
  switch (type) {
    case "AG":
      return "Arbeitsgemeinschaft";
    case "BS":
      return "Blockseminar";
    case "E":
      return "Exkursion";
    case "FP":
      return "feldarchäologisches Praktikum";
    case "FPR":
      return "Forschungspraktikum";
    case "FS":
      return "Forschungsseminar";
    case "GK":
      return "Grundkurs";
    case "K":
      return "Kolloquium";
    case "OS":
      return "Oberseminar";
    case "PROJ":
      return "Projekt";
    case "PUE":
      return "Praktikum/Übung";
    case "S":
      return "Seminar";
    case "TU":
      return "Tutorium";
    case "Ü":
      return "Übung";
    case "V":
      return "Vorlesung";
    case "VS":
      return "Vertiefungsseminar";
    case "SL":
      return "Sonstige Lehrveranstaltung";
    case "PS":
      return "Proseminar";
    case "HS":
      return "Hauptseminar";
    case "R":
      return "Repetitorium";
    case "KK":
      return "Klausurenkurs";
    case "P":
      return "Praktikum";
    case "PROP":
      return "Propädeutikum";
    case "GS":
      return "Geländeseminar";
    case "LFP":
      return "Lehrforschungsprojekt";
    case "PJS":
      return "Projektseminar";
    case "Q":
      return "Quellenkundliche Übung";
    case "KGP":
      return "Kleingruppenprojekt";
    case "SA":
      return "Sprachpraktische Ausbildung";
    case "AL":
      return "Action Learing";
    case "SU":
      return "Seminaristischer Unterricht";
    default:
      return "Sonstige Lehrveranstaltung";
  }
}

export function addConnectionToPersons(entry: Course) {
  const template: Prisma.Person2CourseCreateManyInput[] = [];
  for (let doz of entry.dozs) {
    template.push({
      pId: doz.pId,
      cId: entry.id,
      semester: entry.semester,
    });
  }
  return prisma.person2Course.createMany({
    data: template,
    skipDuplicates: true,
  });
}

export function addCompetences(entry: Course) {
  return prisma.competenceCourse.createMany({
    data: entry.competence,
    skipDuplicates: true,
  });
}

export async function addRooms(rooms: Room[]): Promise<Prisma.BatchPayload> {
  // transform inputs
  for (let room of rooms) {
    if (Number.isNaN(room.size)) {
      room.size = undefined;
    }
  }

  return new Promise(async (resolve, reject) => {
    let count = 0;
    for (let room of rooms) {
      let result = await prisma.room.upsert({
        where: {
          id: room.id,
        },
        create: room,
        update: {
          id: room.id,
          address: room.address,
          short: room.short,
          size: room.size,
        },
      });
      count += result ? 1 : 0;
    }
    resolve({ count });
  });
}

export async function addPersons(persons: Person[]): Promise<Prisma.BatchPayload> {
  return new Promise(async (resolve, reject) => {
    let count = 0;
    for (let person of persons) {
      let result = await prisma.person.upsert({
        where: {
          pId: person.pId,
        },
        create: person,
        update: person,
      });
      count += result ? 1 : 0;
    }
    resolve({ count });
  });
}

export async function extractCompetenceInformation(
  course: Course
): Promise<CompetenceFulfillment[]> {
  const fulfillment = new Promise<CompetenceFulfillment[]>(
    async (resolve, reject) => {
      const compParser = new CompetenceReader();
      const competences = await compParser.parseCompetences(
        course.organizational ? course.organizational : ""
      );
      let data: CompetenceFulfillment[] = [];
      for (let comp of competences) {
        data.push({
          cId: course.id,
          semester: course.semester,
          compId: transformCompId(comp.compId),
          fulfillment: comp.fulfillment,
        });
      }
      resolve(data);
    }
  );
  return fulfillment;
}

export async function addModuleConnection(
  entry: Course
): Promise<Prisma.BatchPayload> {
  let result = { count: 0 };
  const moduleCourses = await prisma.moduleCourse.findMany({
    include: {
      modules: {
        select: {
          acronym: true,
        },
      },
    },
  });
  const template: Prisma.Course2ModuleCourseCreateManyInput[] = [];

  if (moduleCourses) {
    for (let mc of moduleCourses) {
      let name;
      let acronym;
      if (typeof mc.identifier === "object" && mc.identifier) {
        for (let [key, value] of Object.entries(mc.identifier)) {
          if (key == "name") {
            name = value ? value.toString() : "";
          }
          if (key == "acronym") {
            acronym = value ? value.toString() : mc.modules[0].acronym;
          }
        }
      } else {
        name = undefined;
        acronym = mc.modules[0].acronym;
      }

      if (acronym) {
        // check if entry fits to modulecourse
        if (
          // case 1 short title includes acronym and type is same
          (entry.short?.includes(acronym) &&
            entry.type.toLowerCase().includes(mc.type.toLowerCase())) ||
          // case 2 title includes acronym and type is same
          (entry.name.includes(acronym) &&
            entry.type.toLowerCase().includes(mc.type.toLowerCase())) ||
          // case 3 organizational includes acronym, type is the same and additional condition
          (entry.organizational?.includes(acronym) &&
            entry.type.toLowerCase().includes(mc.type.toLowerCase()) &&
            (name == "" ||
              (name && (entry.name.includes(name) || name.length < 3))))
        ) {
          template.push({
            mcId: mc.mcId,
            cId: entry.id,
            semester: entry.semester,
          });
        }
      }
    }

    if (template.length == 0) {
      return result;
    } else {
      return await prisma.course2ModuleCourse.createMany({
        data: template,
        skipDuplicates: true,
      });
    }
  } else {
    return result;
  }
}

function transformCompId(id: string): string {
  return id.replace(/\s|\./g, "_");
}

function transformTerms(terms: any): Term[] {
  if (Array.isArray(terms)) {
    for (let term of terms) {
      term.roomId = term.roomId == "" ? null : term.roomId;
      // transform day and time
      term.exclude = term.exclude ? term.exclude : "";
      term.repeat = term.repeat ? transformRepeat(term.repeat) : "";
      term.starttime = term.starttime ? transformTime(term.starttime) : "";
      term.endtime = term.endtime ? transformTime(term.endtime) : "";
    }
  }
  return terms;
}

export function transformDozs(dozs: { person: Person }[]): Person[] {
  let result: Person[] = [];
  for (let person of dozs) {
    result.push(person.person);
  }
  return result;
}

export function checkSemester(sem: string): string | undefined {
  return validator.matches(String(sem), /\d{4}((w)|(s))/g) ? sem : undefined;
}

export function findCourseParent(
  entry: Course,
  parentCourses: UnivISCourse[]
): Course | undefined {
  for (let parent of parentCourses) {
    let found = parent.children?.find((el) => el.key == entry.id);
    if (found) {
      return transformUnivISCourse(parent, entry.semester);
    }
  }
  return undefined;
}

export function transformEntry(entry: Course, parent: Course): Course {
  // transform competences of parent
  for (let el of parent.competence) {
    el.cId = entry.id;
  }

  return {
    ...entry,
    short: parent.short ? parent.short : entry.short,
    organizational: parent.organizational
      ? parent.organizational
      : entry.organizational,
    desc: parent.desc ? parent.desc : entry.desc,
    literature: parent.literature ? parent.literature : entry.literature,
    ects: parent.ects ? parent.ects : entry.ects,
    sws: parent.sws ? parent.sws : entry.sws,
    competence: parent.competence ? parent.competence : entry.competence,
  };
}

// Univis specific task to clean dataset
function transformRepeat(code: string): string {
  let rhythm = "";
  let weekday = "";
  // Step 1: Split code at space, left part is rhythm and second part is day
  let codes = code.split(" ");
  // Step 2: decode the rhythm
  switch (codes[0]) {
    case "s1":
      rhythm += "Einzeltermin";
      break;
    case "w1":
      rhythm += "Wöchentlich";
      break;
    case "w2":
      rhythm += "Alle zwei Wochen";
      break;
    case "bd":
      rhythm += "Blocktermin";
      break;
    case "d1":
      rhythm += "Täglich";
      break;
    default:
      break;
  }

  // Step 3: decode weekday
  // split weekdays if necessary
  if (codes[1]) {
    let weekdays = codes[1].split(",");
    for (let day of weekdays) {
      switch (day) {
        case "0":
          weekday += " So";
          break;
        case "1":
          weekday += " Mo";
          break;
        case "2":
          weekday += " Di";
          break;
        case "3":
          weekday += " Mi";
          break;
        case "4":
          weekday += " Do";
          break;
        case "5":
          weekday += " Fr";
          break;
        case "6":
          weekday += " Sa";
          break;

        default:
          weekday = "";
          break;
      }
    }
  }

  return `${rhythm}${weekday}`;
}

function transformTime(time: string): string {
  const split = time.split(":");
  const hour = split[0];
  const minutes = split[1];
  if (hour.length == 2) {
    return time;
  } else {
    return `0${hour}:${minutes}`;
  }
}
