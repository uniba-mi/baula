import { Course } from '../../../../../../interfaces/course';
import { Competence } from '../../../../../../interfaces/competence';

export interface ChartSettings {
    unit: string,
    view: string,
    hoveredCourse: Course | undefined,
}

export class Bar {
    pos: number;
    competence: Competence;
    childCompetences: Competence[];
    fulfillment: number;
    fill: string;
    aim?: number;

    constructor(pos: number,
                competence: Competence,
                childCompetences: Competence[],
                fulfillment: number) {
        this.pos = pos;
        this.competence = competence;
        this.childCompetences = childCompetences;
        this.fulfillment = fulfillment;
        this.fill = 'var(--ub-blue)'
    }

    checkFill() {
        if(!this.aim) {
            this.fill = 'var(--ub-blue)'
        } else if(this.aim > this.fulfillment) {
            this.fill = 'var(--ub-blue)'
        } /* TODO: Green currently disabled due to assychronity bug
        else if(this.aim < this.fulfillment) {
            this.fill = 'green'
        } */
    }
}