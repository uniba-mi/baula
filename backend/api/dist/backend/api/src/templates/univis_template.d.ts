export declare const courses: (string | {
    id: string;
    name: string;
    short: string;
    organizational: string;
    desc: string;
    literature: string;
    orgname: string;
    chair: string;
    type: string;
    ects: string;
    sws: string;
    dozs: (string | {
        person: {
            pId: string;
        };
    })[];
    terms: (string | {
        startdate: string;
        enddate: string;
        starttime: string;
        endtime: string;
        repeat: string;
        exclude: string;
        roomId: string;
    })[];
    participationCopy: string;
    importCopy: string;
    children: (string | {
        key: string;
    })[];
    benschein: string;
    schein: string;
    entre: string;
    erwei: string;
    frueh: string;
    gasth: string;
    generale: string;
    kultur: string;
    modulstud: string;
    nach: string;
    spracha: string;
    womspe: string;
    zemas: string;
    zenis: string;
    keywords: string;
    lang: string;
    expAttendance: string;
    format: string;
    nameEn: string;
    literatureEn: string;
    organizationalEn: string;
    descEn: string;
})[];
export declare const persons: (string | {
    pId: string;
    title: string;
    firstname: string;
    lastname: string;
    email: string;
    tel: string;
    office: string;
})[];
export declare const rooms: (string | {
    id: string;
    short: string;
    address: string;
    size: string;
})[];
