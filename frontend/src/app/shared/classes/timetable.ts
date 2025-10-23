export class Timetable {
    semester: string;
    courses: string[];

    constructor(semester: string) {
        this.semester = semester;
        this.courses = [];
    }

    /** ------------------------------
     * Takes course key and transform it into format (/ instead of .) for univis timetable
     * @param key with the format (test.test.test) 
     ---------------------------------*/
    addCourse(key: string) {
        this.courses.push(this.transformKey(key));
    }

    deleteCourse(key: string) {
        let index = this.courses.findIndex(entry => entry == this.transformKey(key))
        this.courses.splice(index, 1);
    }

    getTimetableLink(): string {
        return `https://univis.uni-bamberg.de/form?dsc=anew/lecture_plan:pdf&sem=${this.semester}&lvs=${this.courses.join(',')}`
    }

    getUnivisLink(): string {
        const courseString = this.courses.join(`,${this.semester}/`)
        return `https://univis.uni-bamberg.de/form?dsc=anew/coll&anonymous=1&collection=${this.semester}/${courseString}&sem=${this.semester}`
    }

    private transformKey(key: string): string {
        let coursePath = key.replace(/\./g, '/');
        if(coursePath.startsWith('Lecture')) {
            coursePath = coursePath.slice(8);
        }
        return coursePath;
    }
}
