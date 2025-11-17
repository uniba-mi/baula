export declare const depTemplate: (string | {
    shortName: string;
    name: string;
})[];
export declare const personTemplate: (string | {
    pId: string;
    title: string;
    firstname: string;
    lastname: string;
    email: string;
})[];
export declare const spTemplate: (string | {
    spId: string;
    poVersion: string;
    name: string;
    desc: string;
    date: string;
    faculty: string;
})[];
export declare const mhbTemplate: (string | {
    mhbId: string;
    version: string;
    name: string;
    semester: string;
    desc: string;
    spId: string;
    poVersion: string;
})[];
export declare const mgTemplate: (string | {
    mgId: string;
    version: string;
    name: string;
    fullName: string;
    desc: string;
    ectsMin: string;
    ectsMax: string;
    order: string;
})[];
export declare const mcTemplate: (string | {
    mcId: string;
    name: string;
    identifier: {
        acronym: string;
        name: string;
    };
    type: string;
    language: string;
    term: string;
    order: string;
    compulsory: string;
    desc: string;
    literature: string;
    sws: string;
    ects: string;
})[];
export declare const modTemplate: (string | {
    mId: string;
    version: string;
    acronym: string;
    name: string;
    content: string;
    skills: string;
    addInfo: string;
    priorKnowledge: string;
    ects: string;
    term: string;
    recTerm: string;
    duration: string;
    chair: string;
    offerBegin: string;
    offerEnd: string;
    workload: (string | {
        type: string;
        hours: string;
    })[];
    respPersonId: string;
    prevModules: (string | {
        id: string;
        version: string;
        acronym: string;
        name: string;
        type: string;
    })[];
})[];
export declare const modDepTemplate: (string | {
    followerId: string;
    followerVersion: string;
    followingId: string;
    followingVersion: string;
})[];
export declare const moduleExamTemplate: (string | {
    meId: string;
    shortName: string;
    name: string;
    desc: string;
    duration: string;
    share: string;
    mId: string;
    version: string;
})[];
export declare const per2mcTemplate: (string | {
    pIds: string[];
    mcId: string;
})[];
export declare const sp2mhbTemplate: (string | {
    spId: string;
    poVersion: string;
    mhbId: string;
    version: string;
})[];
export declare const mhb2mgTemplate: (string | {
    mhbId: string;
    mgId: string;
    versionMhb: string;
    versionMg: string;
})[];
export declare const mg2mgTemplate: (string | {
    parentId: string;
    childId: string;
    parentVersion: string;
    childVersion: string;
})[];
export declare const mg2modTemplate: (string | {
    mId: string;
    mgId: string;
    mVersion: string;
    mgVersion: string;
})[];
export declare const m2mcTemplate: (string | {
    mId: string;
    mVersion: string;
    mcId: string;
    ects: string;
    compulsory: string;
    acronym: string;
})[];
