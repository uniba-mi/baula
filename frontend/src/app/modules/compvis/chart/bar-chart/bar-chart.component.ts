import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import type { ECElementEvent, EChartsOption, CustomSeriesOption } from 'echarts';
import type { BarSeriesOption } from 'echarts/charts';
import { Observable } from 'rxjs';
import { State } from 'src/app/reducers';
import { Competence } from '@interfaces/competence';
import { ExpandedCourse } from '@interfaces/course';
import { Bar } from '../../interfaces/chart';
import { selectBar, setBars } from '../../state/chart.actions';
import {
  getHoverBars,
  getHoverSelectBars,
  getSelectedBar,
  getUnit,
  getView,
} from '../../state/chart.selectors';
import { CompAim, User } from '@interfaces/user';
import { getUser, getUserAims } from 'src/app/selectors/user.selectors';
import { getActiveSemester } from 'src/app/selectors/study-planning.selectors';

function resolveCssVar(value: string): string {
  const match = value.match(/^var\((--[\w-]+)\)$/);
  return match
    ? getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim()
    : value;
}

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class BarChartComponent implements OnInit, OnChanges {
  private store = inject<Store<State>>(Store);

  @Input() competences: Competence[];
  @Input() courses: ExpandedCourse[];
  @Input() bars: Bar[] | null;
  // variables for statemanagement
  unit$: Observable<string> = this.store.pipe(select(getUnit));
  view$: Observable<string> = this.store.pipe(select(getView));
  hoverBars$: Observable<Bar[]> = this.store.pipe(select(getHoverBars));
  hoverSelectBars$: Observable<Bar[]> = this.store.pipe(
    select(getHoverSelectBars),
  );
  semester$: Observable<string> = this.store.pipe(select(getActiveSemester));
  compAims$: Observable<CompAim[] | undefined> = this.store.select(getUserAims);
  compAims: CompAim[];
  user$: Observable<User> = this.store.select(getUser);

  // variables for subscription
  selectedBar: Bar;
  currentUnit: string = 'ects';
  semester: string;
  view: string;

  @Output() clickBar = new EventEmitter<number>();

  option: EChartsOption = {};
  hasSelection = false;

  private hoverBars: Bar[] = [];
  private hoverSelectBars: Bar[] = [];

  ngOnInit() {
    // store select for chart
    this.store.select(getSelectedBar).subscribe((selectedBar) => {
      // drives the legend: no point showing an "Ausgewählt" swatch while
      // nothing is actually selected
      this.hasSelection = !!selectedBar;
      if (selectedBar) {
        this.selectedBar = selectedBar;
      }
      // bar.fill is mutated in place on the shared store array by the
      // selectBar/deselectBar reducers, so this observable's own value is the
      // only thing that changes reference here - rebuild to pick up the color.
      this.rebuildOption();
    });
    this.semester$.subscribe((sem) => (this.semester = sem));
    this.view$.subscribe((view) => (this.view = view));
    // subscribe to competence aims
    this.user$.subscribe((user) => {
      if (user.compAims) {
        this.compAims = user.compAims;
        this.assignAimsToBars();
      }
    });
    this.hoverBars$.subscribe((hoverBars) => {
      this.hoverBars = hoverBars;
      this.rebuildOption();
    });
    this.hoverSelectBars$.subscribe((hoverSelectBars) => {
      this.hoverSelectBars = hoverSelectBars;
      this.rebuildOption();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.competences.length != 0) {
      this.competences = this.competences.filter(
        (competence) => competence.parentId === '' || !competence.parentId,
      );
      this.unit$.subscribe((unit) => {
        if (this.currentUnit !== unit) {
          // update bars if unit is changed to adapt changes in bar height
          this.updateBars();
        }
        this.currentUnit = unit;
        this.rebuildOption();
      });
    }

    // if competences or courses change reset bars
    if (changes.courses || changes.competences) {
      this.updateBars();
    }

    this.rebuildOption();
  }

  private updateBars() {
    if (this.competences && this.courses && this.view && this.semester) {
      this.store.dispatch(
        setBars({
          competences: this.competences,
          selectedCourses: this.courses,
          view: this.view,
          semester: this.semester,
        }),
      );
      this.assignAimsToBars();
    }
  }

  assignAimsToBars() {
    if (this.compAims && this.bars) {
      // assign aims to bars
      for (let bar of this.bars) {
        const aim = this.compAims.find(
          (compAim) => compAim.compId == bar.competence.compId,
        );
        if (aim) {
          bar.aim = aim.aim;
        }
      }
      this.rebuildOption();
    }
  }

  // shortens the axis label if the full competence name is too long
  private shortLabel(comp: Competence): string {
    if (comp.name.length > 20) {
      return comp.short.length < 13 ? comp.short : comp.short.slice(0, 10) + '...';
    }
    return comp.name;
  }

  private computeTopValue(bars: Bar[]): number {
    let topValue = 10;
    if (bars.length !== 0) {
      const max = bars
        .map((el) => (el.aim ? (el.aim > el.fulfillment ? el.aim : el.fulfillment) : el.fulfillment))
        .reduce((pv, cv) => (pv > cv ? pv : cv));
      topValue = max > topValue ? Math.round(max + 2) : topValue;
    }
    return topValue;
  }

  // renders the aim per bar as a short horizontal tick, drawn as a 'custom'
  // series rect sized off the actual category band width (api.size) so it
  // tracks the fulfillment bar's own rendered width - a fixed pixel size
  // (e.g. via scatter/symbolSize) can't do that since barWidth is a percentage.
  private buildAimSeries(bars: Bar[]): CustomSeriesOption {
    const data = bars
      .map((b, i): [number, number] | null => (b.aim ? [i, b.aim] : null))
      .filter((point): point is [number, number] => point !== null);

    return {
      name: 'aim',
      type: 'custom',
      silent: true,
      z: 4,
      renderItem: (_params, api) => {
        const categoryIndex = api.value(0) as number;
        const aimValue = api.value(1) as number;
        const point = api.coord([categoryIndex, aimValue]);
        const bandWidth = (api.size!([1, 0]) as number[])[0];
        // main bar is barWidth:'55%' of the band - render the tick slightly wider
        const width = bandWidth * 0.62;
        return {
          type: 'rect',
          shape: {
            x: point[0] - width / 2,
            y: point[1] - 1.5,
            width,
            height: 3,
          },
          style: { fill: '#0FB500' },
        };
      },
      data,
    };
  }

  private rebuildOption(): void {
    if (!this.bars || !this.competences || this.bars.length === 0) {
      this.option = {};
      return;
    }

    const bars = this.bars;
    const showAim = this.currentUnit === 'ects';
    const topValue = this.computeTopValue(bars);

    const series: (BarSeriesOption | CustomSeriesOption)[] = [
      {
        name: 'fulfillment',
        type: 'bar',
        stack: 'growth',
        barWidth: '55%',
        z: 2,
        data: bars.map((b) => ({
          value: b.fulfillment,
          itemStyle: { color: resolveCssVar(b.fill) },
        })),
      },
    ];

    if (showAim) {
      series.push(this.buildAimSeries(bars));
    }

    if (this.hoverBars.length === bars.length) {
      series.push({
        name: 'hoverPreview',
        type: 'bar',
        stack: 'growth',
        barWidth: '55%',
        silent: true,
        z: 1,
        itemStyle: { color: '#4A95CC', opacity: 0.7 },
        data: this.hoverBars.map((hb) => hb.fulfillment),
      });
    }

    if (this.hoverSelectBars.length === bars.length) {
      series.push({
        name: 'hoverContribution',
        type: 'bar',
        barGap: '-100%',
        barWidth: '55%',
        silent: true,
        z: 3,
        itemStyle: { color: '#4A95CC', opacity: 0.9 },
        data: this.hoverSelectBars.map((hsb) => hsb.fulfillment),
      });
    }

    this.option = {
      grid: { left: 8, right: 8, bottom: 56, top: 8, containLabel: true },
      xAxis: {
        type: 'category',
        data: bars.map((b) => this.shortLabel(b.competence)),
        axisLabel: { rotate: 45, hideOverlap: true },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: topValue,
        axisLabel: { formatter: (v: number) => `${v} ${this.currentUnit.toUpperCase()}` },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.seriesName !== 'fulfillment') {
            return '';
          }
          const bar = bars[params.dataIndex];
          return (
            `${bar.competence.compId.replace('_', ' ')} - ${bar.competence.name}: ` +
            `${bar.fulfillment.toFixed(2)} ${this.currentUnit.toUpperCase()}`
          );
        },
      },
      series,
    };
  }

  onChartClick(e: ECElementEvent): void {
    if (e.componentType === 'series' && e.seriesName === 'fulfillment' && typeof e.dataIndex === 'number') {
      this.store.dispatch(selectBar({ index: e.dataIndex }));
    }
  }
}
