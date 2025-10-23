import { Module } from "./module";

export class ModuleGroup {
  mgId: string;
  version: Number;
  name: string;
  fullName: string;
  desc: string;
  ectsMin: Number;
  ectsMax: Number;
  achievedEcts: Number; // not sync with database, individual user attribute
  children?: ModuleGroup[];
  modules?: Module[];
  parent?: { mgId: string, root: boolean };
  order: Number;

  constructor(
    mgId: string,
    version: Number,
    name: string,
    fullName: string,
    desc: string,
    ectsMin: Number | null,
    ectsMax: Number | null,
    achievedEcts: Number,
    parent?: { mgId: string, root: boolean },
    order?: Number,
  ) {
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

  addChildren(children: ModuleGroup[]) {
    this.children = children;
  }

  addModules(modules: Module[]) {
    this.modules = modules;
  }
}

// for mg select with paths
export interface ExtendedModuleGroup extends ModuleGroup {
  path: string;
  level?: number;
}