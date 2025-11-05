"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
class Module {
    constructor(mId, version, acronym, name, content, skills, addInfo, priorKnowledge, ects, term, recTerm, duration, chair, respPerson, exams, prevModules, offerBegin, offerEnd, workload) {
        this.mId = mId;
        this.version = version;
        this.acronym = acronym;
        this.name = name;
        this.content = content;
        this.skills = skills;
        this.addInfo = addInfo;
        this.priorKnowledge = priorKnowledge;
        this.ects = ects;
        this.type = "";
        this.term = term;
        this.recTerm = recTerm;
        this.duration = duration;
        this.chair = chair;
        this.respPerson = respPerson ? respPerson : null;
        this.exams = exams;
        this.prevModules = prevModules;
        this.mgId = "";
        this.extractedPrevModules = [];
        this.allPriorModules = [];
        this.mCourses = [];
        this.isDropped = false;
        this.offerBegin = offerBegin;
        this.offerEnd = offerEnd;
        this.workload = workload;
    }
    addCourses(courses) {
        this.mCourses = courses;
    }
    addParentMgId(mgId) {
        this.mgId = mgId;
    }
    addExtractedPrevModules(extractedPrevModules) {
        this.extractedPrevModules = extractedPrevModules;
    }
    addAllPriorModules(allPriorModules) {
        this.allPriorModules = allPriorModules;
    }
    addTypeInfo(type) {
        this.type = type;
    }
}
exports.Module = Module;
