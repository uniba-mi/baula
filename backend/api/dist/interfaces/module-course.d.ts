import { Person } from "./person";
export declare class ModuleCourse {
    mcId: string;
    name: string;
    identifier: {
        name: string;
        acronym: string;
    };
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
    module: {
        mId: string;
        acronym: string;
    };
    constructor(mcId: string, name: string, lecturers: {
        person: Person;
    }[], type: string, language: string, term: string, compulsory: boolean, desc: string, literature: string, ects: number | null, sws: number | null, mId: string, acronym: string, order?: number | null);
}
