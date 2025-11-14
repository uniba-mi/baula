export const courses = ['//Lecture', {
    id: "@key",
    name: "name",
    short: "short",
    organizational: "concat(time_description, '<split>', comment, '<split>', async_description, '<split>' ,organizational)",
    desc: "summary",
    literature: "literature",
    orgname: 'orgunits/orgunit',
    chair: 'orgname',
    type: 'type',
    ects: 'number(ects_cred)',
    sws: 'number(sws)',
    dozs: ["dozs/doz", {
        person: {
            pId: "UnivISRef/@key"
        }
    }],
    terms: [ "terms/term", {
        startdate: "startdate",
        enddate: "enddate",
        starttime: "starttime",
        endtime: "endtime",
        repeat: "repeat",
        exclude: "exclude",
        roomId: "room/UnivISRef/@key"
    }],
    participationCopy: "boolean(participation_parent_id)",
    importCopy: "boolean(import_parent_id)",
    children: ["courses/course", {
        key: 'UnivISRef/@key'
    }],
    
    // additional information, that will be merged into add_info later
    benschein: "boolean(benschein)", // benoteter Schein
    schein: "boolean(schein)", // Schein
    entre: "boolean(entre)", // Entrepreneurship und Existenzgründung
    erwei: "boolean(erwei)", // Erweiterungsbereich
    frueh: "boolean(frueh)", // Frühstudium
    gasth: "boolean(gasth)", // Gaststudierendenverzeichnis
    generale: "boolean(generale)", // Studium Generale
    kultur: "boolean(kultur)", // Kultur und Bildung
    modulstud: "boolean(modulstud)", // Modulstudium
    nach: "boolean(nach)", // Nachhaltigkeit
    spracha: "boolean(spracha)", // Sprachangebot
    womspe: "boolean(womspe)", // Gender und Diversität
    zemas: "boolean(zemas)", // Zentrum für Mittelalterstudien
    zenis: "boolean(zenis)", // Zentrum für Interreligiöse Studien

    // course information to be added to scheme
    keywords: "keywords",
    lang: "leclanguage", 
    expAttendance: "number(turnout)", 
    format: "format", /* praesenz (Präsenz), 
                         hybrid (Präsenz + Online-Anteile), 
                         both (Präsenz/Online parallel),
                         online (Rein Online),
                         none (Fällt aus) */

    // english course information
    nameEn: "ects_name",
    literatureEn: "ects_literature",
    organizationalEn: "ects_organizational",
    descEn: "ects_summary"
}];

export const persons = ['//Person', {
    pId: '@key',
    title: 'atitle',
    firstname: 'firstname',
    lastname: 'lastname',
    email: 'locations/location/email',
    tel: 'locations/location/tel',
    office: 'locations/location/office'
}];

export const rooms = ['//Room', {
    id: "@key",
    short: "short",
    address: "address",
    size: "number(size)"
}];