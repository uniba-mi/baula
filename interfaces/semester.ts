export class Semester {
    // name is representing univisName
    name: string;

    /**
     * Constructor of semester class
     * @param name need to be form of 'YYYYs' for summer semester or 'YYYYw' for winter semester 
     * Can also be initialized empty to make a Semester-Instance with the current Semester
    */
    constructor(name?: string) {
        if (name) {
            if(name.endsWith('s') || name.endsWith('w')) {
                // name has unvis format
                this.name = name;
            } else if(name.length === 5) {
                if(name.endsWith('1')) {
                    this.name = `${name.slice(0,4)}s`
                } else if(name.endsWith('2')) {
                    this.name = `${name.slice(0,4)}w`
                } else {
                    // else case set to current semester
                    this.name = this.currentSemester()
                }
            } else {
                // else case set to current semester
                this.name = this.currentSemester()
            }
            
        } else {
            this.name = this.currentSemester()
        }
    }

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

    // gets new name in the format 2022w etc.
    static getCurrentSemesterName(): string {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        let currentSemesterType;

        if (currentMonth >= 2 && currentMonth < 8) {
            currentSemesterType = 's';
        } else {
            currentSemesterType = 'w';
        }

        return `${currentYear}${currentSemesterType}`;
    }

    get semesterDate() {
        const month = this.name.endsWith('s') ? 3 : 9;
        const year = Number(this.name.slice(0, 4));
        return new Date(year, month, 15);
    }

    get shortName() {
        let term, year = '';
        if (this.name.endsWith('w')) {
            term = 'WS ';
            year = `${this.name.slice(0, 4)}/${Number(this.name.slice(2, 4)) + 1}`
        } else {
            term = 'SS ';
            year = this.name.slice(0, 4)
        }
        return term + year;
    }

    get fullName() {
        let year, term = '';
        if (this.name.endsWith('w')) {
            term = 'Wintersemester ';
            year = `${this.name.slice(0, 4)}/${Number(this.name.slice(2, 4)) + 1}`
        } else {
            term = 'Sommersemester ';
            year = this.name.slice(0, 4)
        }
        return term + year;
    }

    get apNr() {
        if (this.name.endsWith('w')) {
            return `${this.name.slice(0,4)}2`
        } else {
            return `${this.name.slice(0,4)}1`
        }
    }

    get year() {
        return parseInt(this.name.substring(0, 4), 10);
    }

    get type() {
        return this.name.charAt(4);
    }

    private currentSemester() {
        const today = new Date();
        // const today = new Date(2027, 5, 4, 0, 0, 0); // set to future date for Semesterabschluss debugging
        const year = today.getFullYear();
        // get month starts from 0 (january) to 11 (december)
        // current WS: Sept (8) - Feb (1)
        // current SS: Mar (2) - Aug (7)
        const month = today.getMonth();
        if (month < 8 && month >= 2) {
            return `${year.toString()}s`;
        } else if (month >= 8) {
            return `${year.toString()}w`;
        } else {
            return `${(year - 1).toString()}w`;
        }
    }

    getSemesterList(duration: number): Semester[] {
        let result: Semester[] = [];
        result.push(this);
        for (let i = 1; i < duration; i++) {
            result.push(this.getNextSemester(result[i - 1]));
        }
        return result;
    }

    // is a semester a past semester
    isPastSemester(): boolean {
        const today = new Date();
        // const today = new Date(2027, 5, 4, 0, 0, 0); // set to future date for Semesterabschluss debugging
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        if (!this.isCurrentSemester()) {
            if (this.year < currentYear) {
                // all semester with earlier year
                return true;
            } else if (this.year === currentYear && currentMonth >= 8) {
                return true;
            }
        }

        return false;
    }

    // is a semester a future semester
    isFutureSemester(): boolean {
        const today = new Date();
        // const today = new Date(2027, 5, 4, 0, 0, 0); // set to future date for Semesterabschluss debugging
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        if (!this.isCurrentSemester()) {
            if (this.year > currentYear) {
                // all semester with later year
                return true;
            } else if (this.year === currentYear && currentMonth < 8) {
                return true;
            }
        }

        return false;
    }

    // current semester based on date
    isCurrentSemester(): boolean {
        const today = new Date();
        // const today = new Date(2027, 5, 4, 0, 0, 0); // set to future date for Semesterabschluss debugging
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        if (currentMonth < 2 && this.year === currentYear - 1 && this.type === 'w') {
            // represents winter semester ending
            return true;
        } else if (currentMonth >= 2 && currentMonth < 8 && this.year === currentYear && this.type === 's') {
            // representing summer semester
            return true;
        } else if (currentMonth >= 8 && this.year === currentYear && this.type === 'w') {
            // representing winter semester beginning
            return true;
        }

        return false;
    }

    // get next semester for univis (2022w) format
    getNextSemester(semester: Semester): Semester {
        let year = semester.name.slice(0, -1)
        let season = semester.name.slice(-1);
        if (season === 's') {
            season = 'w';
        } else {
            season = 's';
            year = String(Number(year) + 1);
        }
        return new Semester(`${year}${season}`);
    }

    // get previous semester for univis (2022w) format
    getPreviousSemester(semester: Semester): Semester {
        let year = semester.name.slice(0, -1)
        let season = semester.name.slice(-1);
        if (season === 's') {
            season = 'w';
            year = String(Number(year) - 1);
        } else {
            season = 's';
        }
        return new Semester(`${year}${season}`);
    }
}
