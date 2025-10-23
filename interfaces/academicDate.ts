export interface AcademicDate extends AcademicDateTemplate {
    id: number,
}

export interface AcademicDateTemplate {
    startdate: string,
    enddate: string,
    starttime?: string,
    endtime?: string,
    semester: string,
    desc?: string,
    dateType: DateType
}

export interface DateType {
    typeId: number,
    name: string,
    desc: string
}