export const depTemplate = ['//Fak', {
    shortName: 'Kurzbez',
    name: 'Bez'
}];

export const personTemplate = ['//Person', {
    pId: '@Personid',
    title: 'Akadgrad',
    firstname: 'Vorname',
    lastname: 'Nachname',
    email: 'Email'
}];

export const spTemplate = ['//Po', {
    spId: '@Studfach',
    poVersion: 'number(@Po)',
    name: 'Studfach/Bez',
    desc: 'Bez',
    date: 'Datum',
    faculty: 'Studfach/Fak/Kurzbez'
}];

export const mhbTemplate = ['//Modulhandbuch', {
    mhbId: "@Modulhandbuch",
    version: "number(@Version)",
    name: "Bez",
    semester: "Semester/Zeugnisbez",
    desc: "normalize-space(Beschreibung/html/body/p)",
    spId: 'MhbPos/MhbPo/Po/@Studfach',
    poVersion: 'number(MhbPos/MhbPo/Po/@Po)'
}];

export const mgTemplate = ['//Modulgruppe', {
    mgId: '@Modulgruppe',
    version: "number(@Version)",
    name: 'Bez',
    fullName: "concat(Bez, ' (', Modulgruppehier/Typname, ')')",
    desc: "normalize-space(raw(Beschreibung/html/child::body))",
    ectsMin: 'number(Ectsmin)',
    ectsMax: 'number(Ectsmax)',
    order: 'number(Ordnummer)'
}];

export const mcTemplate = ['//ModulLv', {
    mcId: '@ModulLv',
    name: 'Bez',
    identifier: {
        acronym: '../../KurzBez',
        name: 'Bez',
    },
    type: 'Lehrformen/ModulLvForm/Bez',
    language: 'Sprache/Bez',
    term: 'Haeufigkeit/Bez',
    order: 'number(Reihenfolge)',
    compulsory: 'boolean(Pflicht)',
    desc: "normalize-space(translate(Inhalte/html/child::body,'\n',' '))",
    literature: "normalize-space(Literatur/html/body)",
    sws: "number(translate(Sws,',','.'))",
    ects: "number(translate(EctsPunkte,',','.'))",
}];

export const modTemplate = ['//StudienModul[parent::GruppeModul]', {
    mId: '@StudienModul',
    version: 'number(@Version)',
    acronym: 'KurzBez',
    name: 'Bez',
    content: "normalize-space(raw(Inhalte/html/child::body))",
    skills: "normalize-space(raw(Lernziele/html/child::body))",
    addInfo: "normalize-space(raw(BemerkungExtern/html/child::body))",
    priorKnowledge: "normalize-space(raw(Voraussetzungen/html/child::body))",
    ects: "number(translate(EctsPunkte,',','.'))",
    term: 'Haeufigkeit/Bez',
    recTerm: 'Minfachsem',
    duration: 'Dauer',
    chair: 'Orgeinheit/Bez',
    offerBegin: 'Semester[@Role="SemesterByVon"]/Zeugnisbez',
    offerEnd: 'Semester[@Role="SemesterByBis"]/Zeugnisbez',
    workload: ['Workloads/Arbeitsaufwand', {
        type: 'AufwandArt/Bez',
        hours: 'number(Arbeitsaufwand)'
    }],
    respPersonId: "Person[@Role='Verantwortlich']/@Personid",
    // additionally to modDep-Table to enable full dependencies (explanation see Readme in prisma folder)
    prevModules: ['SortedAlleVorModule/StudienModul', {
            id: '@StudienModul',
            version: '@Version',
            acronym: 'KurzBez',
            name: 'Bez',
            type: 'ModulVlTyp/Bez'
    }]
}];

// module dependencies via own n:m relational table, currently not in use but available.
export const modDepTemplate = ['//StudienModul[parent::SortedAlleVorModule]', {
    followerId: '../../@StudienModul',
    followerVersion: 'number(../../@Version)',
    followingId: '@StudienModul',
    followingVersion: 'number(@Version)'
}]

export const moduleExamTemplate = ['//ModulPrfs[parent::StudienModul]/ModulPrf', {
    meId: 'number(@ModulPrf)',
    shortName: 'KurzBez',
    name: 'Bez',
    desc: "normalize-space(translate(Beschreibung/html/child::body,'\n',' '))",
    duration: 'number(Pruefdauer)',
    share: 'AnteilNote',
    mId: '../../@StudienModul',
    version: 'number(../../@Version)'
}]

export const per2mcTemplate = ['//ModulLv', {
    pIds: ['Dozenten/Person', 
        '@Personid'
    ],
    mcId: '@ModulLv'
}]

export const mhb2mgTemplate = ['//HandbuchGruppe', {
    mhbId: '@Modulhandbuch',
    mgId: '@Modulgruppe',
    versionMhb: 'number(@VersionHandbuch)',
    versionMg: 'number(@VersionGruppe)',
}];

export const mg2mgTemplate = ['//ModulgruppeVor', {
    parentId: '@VorGruppe',
    childId: '@NachGruppe',
    parentVersion: 'number(@VorVersion)',
    childVersion: 'number(@NachVersion)'
}];

export const mg2modTemplate = ['//GruppeModul', {
    mId: '@StudienModul',
    mgId: '@Modulgruppe',
    mVersion: 'number(@VersionModul)',
    mgVersion: 'number(@VersionGruppe)',
}];

export const m2mcTemplate = ['//ModulLv', {
    mId: '../../@StudienModul',
    mVersion: 'number(../../@Version)',
    mcId: '@ModulLv',
    ects: 'number(Ects)',
    compulsory: 'boolean(Pflicht)',
    acronym: '../../KurzBez',
}];