export declare class Semester {
    name: string;
    /**
     * Constructor of semester class
     * @param name need to be form of 'YYYYs' for summer semester or 'YYYYw' for winter semester
     * Can also be initialized empty to make a Semester-Instance with the current Semester
    */
    constructor(name?: string);
    /**
     * Getter:
     * - getter semesterDate**: Returns a Date object representing the approximate date of the semester's start (March 15 for summer and September 15 for winter).
     * - getter shortName**: Returns a short version of the semester's name, e.g., 'SS 2022' or 'WS 2022/23'.
     * - getter fullName**: Returns the full name of the semester, e.g., 'Sommersemester 2022' or 'Wintersemester 2022/23'.
     * - getter year**: Returns the year part of the semester (e.g., 2022).
     * - getter type**: Returns 's' for summer semester and 'w' for winter semester.
     *
     * Functions:
     * - static getCurrentSemesterName()**: Returns the name of the current semester in the 'YYYYs' or 'YYYYw' format.
     * - getSemesterList(duration: number)**: Returns a list of Semester instances, starting from the current one, for the given duration.
     * - isPastSemester()**: Checks if the semester is in the past compared to the current date.
     * - isFutureSemester()**: Checks if the semester is in the future compared to the current date.
     * - isCurrentSemester()**: Determines if the semester corresponds to the current semester based on the current date.
     * - private currentSemester()**: Determines the current semester (internal utility).
     * - private getNextSemester(semester: Semester)**: Returns the next semester (either 's' or 'w') after the given one.
     */
    static getCurrentSemesterName(): string;
    get semesterDate(): Date;
    get shortName(): string;
    get fullName(): string;
    get apNr(): string;
    get year(): number;
    get type(): string;
    private currentSemester;
    getSemesterList(duration: number): Semester[];
    isPastSemester(): boolean;
    isFutureSemester(): boolean;
    isCurrentSemester(): boolean;
    getNextSemester(semester: Semester): Semester;
    getPreviousSemester(semester: Semester): Semester;
}
