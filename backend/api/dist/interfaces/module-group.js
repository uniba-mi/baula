"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleGroup = void 0;
class ModuleGroup {
    constructor(mgId, version, name, fullName, desc, ectsMin, ectsMax, achievedEcts, parent, order) {
        this.mgId = mgId;
        this.version = version;
        this.name = name;
        this.fullName = fullName;
        this.desc = desc;
        this.ectsMin = ectsMin ? ectsMin : 0;
        this.ectsMax = ectsMax ? ectsMax : 0;
        this.parent = parent;
        this.order = order ? order : -99;
        this.achievedEcts = achievedEcts;
    }
    addChildren(children) {
        this.children = children;
    }
    addModules(modules) {
        this.modules = modules;
    }
}
exports.ModuleGroup = ModuleGroup;
