"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleHandbook = void 0;
class ModuleHandbook {
    constructor(id, version, name, desc, semester) {
        this.mhbId = id;
        this.version = version;
        this.name = name;
        this.desc = desc;
        this.semester = semester;
        this.mgs = [];
    }
    addModuleGroups(mgs) {
        this.mgs = this.mgs.concat(mgs);
    }
}
exports.ModuleHandbook = ModuleHandbook;
