"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modulehandbook = void 0;
class Modulehandbook {
    constructor(id, version, name, desc, semester, spId, poVersion) {
        this.mhbId = id;
        this.version = version;
        this.name = name;
        this.desc = desc;
        this.semester = semester;
        this.spId = spId;
        this.poVersion = poVersion;
        this.mgs = [];
    }
    addModuleGroups(mgs) {
        this.mgs = this.mgs.concat(mgs);
    }
}
exports.Modulehandbook = Modulehandbook;
