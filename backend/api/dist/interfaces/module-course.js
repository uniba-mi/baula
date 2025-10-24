"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleCourse = void 0;
class ModuleCourse {
    constructor(mcId, name, lecturers, type, language, term, compulsory, desc, literature, ects, sws, mId, acronym, order) {
        this.mcId = mcId;
        this.name = name;
        this.identifier = {
            name: name,
            acronym: acronym
        };
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
exports.ModuleCourse = ModuleCourse;
