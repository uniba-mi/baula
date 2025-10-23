import { Component, Input, SimpleChanges } from '@angular/core';
import { Competence, Fulfillment } from '../../../../../../../interfaces/competence';
import { Bar } from '../../interfaces/chart';
import * as d3 from 'd3';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { deselectBar } from '../../state/chart.actions';
import {
  ExpandedCourse
} from '../../../../../../../interfaces/course';

@Component({
    selector: 'app-donut-chart',
    templateUrl: './donut-chart.component.html',
    styleUrls: ['./donut-chart.component.scss'],
    standalone: false
})
export class DonutChartComponent {
  @Input() competences: Competence[];
  @Input() bars: Bar[] | null;
  @Input() selectedBar: Bar | null | undefined;
  @Input() courses: ExpandedCourse[];

  fulfillment: Fulfillment[];
  childCompetences: Competence[];
  donutChartData: any[];

  // strings for the additional information
  shortDescription: string;
  description: string;
  longDescription: string;

  // declare global variables of the donut chart
  width = 200;
  height = 200;
  margin = 20;
  radius = Math.min(this.width, this.height) / 2 - this.margin;
  dataReady: any[];
  textPosition: any[];

  // define color-Range
  color = [
    'rgba(0,69,125,0.6)',
    'rgba(255,211,0,0.6)',
    'rgba(151,191,13,0.6)',
    'rgba(230,68,79,0.6)',
    'rgba(135,135,131,0.6)',
    'rgba(255,255,255,0.6)',
    'rgba(26,23,27,0.6)',
  ];

  // define arc and pie Generator
  arc = d3
    .arc()
    .outerRadius(this.radius)
    .innerRadius(this.radius - 0.6 * this.radius);

  pie = d3.pie<Fulfillment>().value((d: Fulfillment) => {
    if (d) {
      return d.fulfillment;
    } else {
      return 0;
    }
  });

  constructor(private store: Store<State>) {}

  ngOnInit() {
    //initialize donutChartData
    this.donutChartData = this.updateDonutChartData();
  }

  ngOnChanges(changes: SimpleChanges) {
    // trigger deselect when competences change
    if (
      changes.competences &&
      (!changes.competences.firstChange &&
        (changes.competences.currentValue &&
          changes.competences.previousValue &&
          changes.competences.currentValue.length !==
            changes.competences.previousValue.length))
    ) {
      this.store.dispatch(deselectBar());
    }

    // trigger changes in bars or selected bar
    if (this.selectedBar && this.bars) {
      if (this.bars.length !== 0) {
        if (
          this.bars[this.selectedBar.pos] &&
          this.bars[this.selectedBar.pos].fulfillment === 0
        ) {
          this.store.dispatch(deselectBar());
        }
      } else {
        this.store.dispatch(deselectBar());
      }
    }

    // trigger data update, when course or selectedBar changes
    if (
      (changes.courses || changes.selectedBar) &&
      this.courses &&
      this.selectedBar
    ) {
      this.fulfillment = this.getData(this.courses, this.selectedBar);
    }

    // update donutChartData when values are changing
    this.donutChartData = this.updateDonutChartData();
  }

  getData(courses: ExpandedCourse[], bar: Bar): Fulfillment[] {
    let result: Fulfillment[] = [];
    const childCompetences = bar.childCompetences;
    for (const comp of childCompetences) {
      let fulfillment: number = 0;
      for (const course of courses) {
        let ful = course.competence.find((el) => el.compId == comp.compId);
        fulfillment += ful ? ful.fulfillment : 0;
      }
      result.push({ compId: comp.compId, fulfillment });
    }
    return result;
  }

  getShortDescription(index: number): string {
    // find the right short-description
    if (this.selectedBar) {
      return (
        this.selectedBar.childCompetences[index].compId.split('_')[1] +
        '.' +
        this.selectedBar.childCompetences[index].compId.split('_')[2]
      );
    }
    return '';
  }

  mouseInDonutPart(index: number) {
    this.competences.map((data) => {
      if (data.compId === this.childCompetences[index].compId) {
        this.shortDescription = data.short;
        this.description = data.name;
        this.longDescription = data.desc;
      }
    });
    let infoField = document.getElementById('infoField');
    if (infoField) {
      infoField.style.display = 'block';
    }
    let hint = document.getElementById('hint');
    if (hint) {
      hint.style.display = 'none';
    }
  }

  mouseOutDonutPart() {
    let infoField = document.getElementById('infoField');
    if (infoField) {
      infoField.style.display = 'none';
    }
    let hint = document.getElementById('hint');
    if (hint) {
      hint.style.display = 'block';
    }
  }

  updateDonutChartData(): any[] {
    // check if variables are not undefined
    if (
      this.selectedBar &&
      this.fulfillment !== undefined &&
      this.competences !== undefined
    ) {
      // set block variables
      this.childCompetences = this.selectedBar.childCompetences;

      const donutChartData: any[] = [];

      this.childCompetences.forEach((comp) => {
        donutChartData.push(
          this.fulfillment.find((c) => c.compId == comp.compId)
        );
      });

      d3.select('#donut-chart svg').attr(
        'viewBox',
        '0 0 ' + this.width + ' ' + this.height
      );

      // translate into center of box
      d3.select('#donut-chart svg g').attr(
        'transform',
        'translate(' + this.width / 2 + ', ' + this.height / 2 + ')'
      );
      return this.pie(donutChartData);
    }
    return [];
  }
}
