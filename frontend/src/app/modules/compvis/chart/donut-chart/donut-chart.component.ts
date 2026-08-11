import { Component, Input, SimpleChanges, inject } from '@angular/core';
import { Competence, Fulfillment } from '@interfaces/competence';
import { Bar } from '../../interfaces/chart';
import type { ECElementEvent, EChartsOption } from 'echarts';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { deselectBar } from '../../state/chart.actions';
import { ExpandedCourse } from '@interfaces/course';

interface DonutSliceDatum {
  name: string;
  compId: string;
  shortCode: string;
  value: number;
  itemStyle: { color: string };
}

@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.scss'],
  standalone: false,
})
export class DonutChartComponent {
  private store = inject<Store<State>>(Store);

  @Input() competences: Competence[];
  @Input() bars: Bar[] | null;
  @Input() selectedBar: Bar | null | undefined;
  @Input() courses: ExpandedCourse[];

  fulfillment: Fulfillment[];
  childCompetences: Competence[];

  // strings for the additional information
  shortDescription: string;
  description: string;
  longDescription: string;
  showInfo = false;

  option: EChartsOption = {};

  // define color-Range
  private readonly palette = [
    'rgba(0,69,125,0.6)',
    'rgba(255,211,0,0.6)',
    'rgba(151,191,13,0.6)',
    'rgba(230,68,79,0.6)',
    'rgba(135,135,131,0.6)',
    'rgba(255,255,255,0.6)',
    'rgba(26,23,27,0.6)',
  ];

  ngOnInit() {
    this.rebuildOption();
  }

  ngOnChanges(changes: SimpleChanges) {
    // trigger deselect when competences change
    if (
      changes.competences &&
      !changes.competences.firstChange &&
      changes.competences.currentValue &&
      changes.competences.previousValue &&
      changes.competences.currentValue.length !==
        changes.competences.previousValue.length
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

    // update chart option when values are changing
    this.rebuildOption();
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

  onSliceInteract(e: ECElementEvent): void {
    if (e.componentType !== 'series' || !e.data) {
      return;
    }
    this.showInfoFor((e.data as DonutSliceDatum).compId);
  }

  showInfoFor(compId: string): void {
    const comp = this.competences.find((c) => c.compId === compId);
    if (!comp) {
      return;
    }
    this.shortDescription = comp.short;
    this.description = comp.name;
    this.longDescription = comp.desc;
    this.showInfo = true;
  }

  hideInfo(): void {
    this.showInfo = false;
  }

  private rebuildOption(): void {
    if (
      !this.selectedBar ||
      this.fulfillment === undefined ||
      this.competences === undefined
    ) {
      this.option = {};
      return;
    }

    this.childCompetences = this.selectedBar.childCompetences;

    const data: DonutSliceDatum[] = this.childCompetences
      .map((comp, idx) => ({
        name: comp.compId,
        compId: comp.compId,
        shortCode: `${comp.compId.split('_')[1]}.${comp.compId.split('_')[2]}`,
        value: this.fulfillment.find((f) => f.compId === comp.compId)?.fulfillment ?? 0,
        itemStyle: { color: this.palette[idx % this.palette.length] },
      }))
      .filter((d) => d.value !== 0);

    this.option = {
      tooltip: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['42%', '78%'],
          label: {
            show: true,
            position: 'inside',
            fontSize: 13,
            fontWeight: 'bold',
            color: '#000',
            textBorderColor: '#fff',
            textBorderWidth: 3,
            formatter: (p: any) => (p.data as DonutSliceDatum).shortCode,
          },
          labelLine: { show: false },
          itemStyle: { borderColor: 'black', borderWidth: 1, opacity: 0.7 },
          data,
        },
      ],
    };
  }
}
