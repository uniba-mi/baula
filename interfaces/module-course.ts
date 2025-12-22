import { Person } from "./person";

export class ModuleCourse {
    mcId: string;
    name: string;
    // identifier defines different unique params to check if univis course can be mapped on module-course
    // 1 is name of course and 0 is acronym of module
    identifier: { name: string, acronym: string}; 
    lecturers: Person[];
    type: string;
    language: string;
    term: string;
    order?: number | null;
    compulsory: boolean;
    desc: string;
    literature: string;
    ects?: number;
    sws?: number;
    module: { mId: string; acronym: string };
  
    constructor(
      mcId: string,
      name: string,
      lecturers: { person: Person }[],
      type: string,
      language: string,
      term: string,
      compulsory: boolean,
      desc: string,
      literature: string,
      ects: number | null,
      sws: number | null,
      mId: string,
      acronym: string,
      order?: number | null
    ) {
      this.mcId = mcId;
      this.name = name;
      this.identifier = {
        name: name,
        acronym: acronym
      }
      // transform lecturers --> remove person identifier that comes from db-request
      this.lecturers = [];
      if (lecturers) {
        for (const lecturer of lecturers) {
          this.lecturers.push(lecturer.person);
        }
      }
      this.type = type;
      this.language = language;
      this.term = term;
      this.compulsory = compulsory;
      this.desc = desc;
      this.literature = literature;
      this.ects = ects ? ects : undefined;
      this.sws = sws ? sws : undefined;
      this.module = {
        mId,
        acronym,
      };
      this.order = order;
    }
  }
