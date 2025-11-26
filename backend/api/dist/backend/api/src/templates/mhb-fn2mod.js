"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.m2mcTemplate = exports.mg2modTemplate = exports.mg2mgTemplate = exports.mhb2mgTemplate = exports.sp2mhbTemplate = exports.per2mcTemplate = exports.moduleExamTemplate = exports.modDepTemplate = exports.modTemplate = exports.mcTemplate = exports.mgTemplate = exports.mhbTemplate = exports.spTemplate = exports.personTemplate = exports.depTemplate = void 0;
exports.depTemplate = ['//Fak', {
        shortName: 'Kurzbez',
        name: 'Bez'
    }];
exports.personTemplate = ['//Person', {
        pId: '@Personid',
        title: 'Akadgrad',
        firstname: 'Vorname',
        lastname: 'Nachname',
        email: 'Email'
    }];
exports.spTemplate = ['//Po', {
        spId: '@Studfach',
        poVersion: 'number(@Po)',
        name: 'Studfach/Bez',
        desc: 'Bez',
        date: 'Datum',
        faculty: 'Studfach/Fak/Kurzbez'
    }];
exports.mhbTemplate = ['//Modulhandbuch', {
        mhbId: "@Modulhandbuch",
        version: "number(@Version)",
        name: "Bez",
        semester: "Semester/Zeugnisbez",
        desc: "normalize-space(Beschreibung/html/body/p)",
        spId: 'MhbPos/MhbPo/Po/@Studfach',
        poVersion: 'number(MhbPos/MhbPo/Po/@Po)'
    }];
exports.mgTemplate = ['//Modulgruppe', {
        mgId: '@Modulgruppe',
        version: "number(@Version)",
        name: 'Bez',
        fullName: "concat(Bez, ' (', Modulgruppehier/Typname, ')')",
        desc: "normalize-space(raw(Beschreibung/html/child::body))",
        ectsMin: 'number(Ectsmin)',
        ectsMax: 'number(Ectsmax)',
        order: 'number(Ordnummer)'
    }];
exports.mcTemplate = ['//ModulLv', {
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
exports.modTemplate = ['//StudienModul[parent::GruppeModul]', {
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
exports.modDepTemplate = ['//StudienModul[parent::SortedAlleVorModule]', {
        followerId: '../../@StudienModul',
        followerVersion: 'number(../../@Version)',
        followingId: '@StudienModul',
        followingVersion: 'number(@Version)'
    }];
exports.moduleExamTemplate = ['//ModulPrfs[parent::StudienModul]/ModulPrf', {
        meId: 'number(@ModulPrf)',
        shortName: 'KurzBez',
        name: 'Bez',
        desc: "normalize-space(translate(Beschreibung/html/child::body,'\n',' '))",
        duration: 'number(Pruefdauer)',
        share: 'AnteilNote',
        mId: '../../@StudienModul',
        version: 'number(../../@Version)'
    }];
exports.per2mcTemplate = ['//ModulLv', {
        pIds: ['Dozenten/Person',
            '@Personid'
        ],
        mcId: '@ModulLv'
    }];
exports.sp2mhbTemplate = ['//MhbPo', {
        spId: 'Po/@Studfach',
        poVersion: 'number(Po/@Po)',
        mhbId: '@Modulhandbuch',
        version: 'number(@Version)',
    }];
exports.mhb2mgTemplate = ['//HandbuchGruppe', {
        mhbId: '@Modulhandbuch',
        mgId: '@Modulgruppe',
        versionMhb: 'number(@VersionHandbuch)',
        versionMg: 'number(@VersionGruppe)',
    }];
exports.mg2mgTemplate = ['//ModulgruppeVor', {
        parentId: '@VorGruppe',
        childId: '@NachGruppe',
        parentVersion: 'number(@VorVersion)',
        childVersion: 'number(@NachVersion)'
    }];
exports.mg2modTemplate = ['//GruppeModul', {
        mId: '@StudienModul',
        mgId: '@Modulgruppe',
        mVersion: 'number(@VersionModul)',
        mgVersion: 'number(@VersionGruppe)',
    }];
exports.m2mcTemplate = ['//ModulLv', {
        mId: '../../@StudienModul',
        mVersion: 'number(../../@Version)',
        mcId: '@ModulLv',
        ects: 'number(Ects)',
        compulsory: 'boolean(Pflicht)',
        acronym: '../../KurzBez',
    }];
