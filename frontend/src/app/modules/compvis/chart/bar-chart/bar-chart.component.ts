import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as d3 from 'd3';
import { Observable } from 'rxjs';
import { State } from 'src/app/reducers';
import { Competence } from '../../../../../../../interfaces/competence';
import { ExpandedCourse } from '../../../../../../../interfaces/course';
import { Bar } from '../../interfaces/chart';
import { selectBar, setBars } from '../../state/chart.actions';
import {
  getHoverBars,
  getHoverSelectBars,
  getSelectedBar,
  getUnit,
  getView,
} from '../../state/chart.selectors';
import { CompAim, User } from '../../../../../../../interfaces/user';
import { getUser, getUserAims } from 'src/app/selectors/user.selectors';
import { getActiveSemester } from 'src/app/selectors/study-planning.selectors';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss'],
    standalone: false
})
export class BarChartComponent implements OnInit, OnChanges {
  @Input() competences: Competence[];
  @Input() courses: ExpandedCourse[];
  @Input() bars: Bar[] | null;

  constructor(private store: Store<State>) {}
  // variables for statemanagement
  unit$: Observable<string> = this.store.pipe(select(getUnit));
  view$: Observable<string> = this.store.pipe(select(getView));
  hoverBars$: Observable<Bar[]> = this.store.pipe(select(getHoverBars));
  hoverSelectBars$: Observable<Bar[]> = this.store.pipe(
    select(getHoverSelectBars)
  );
  semester$: Observable<string> = this.store.pipe(select(getActiveSemester));
  compAims$: Observable<CompAim[] | undefined> = this.store.select(getUserAims);
  compAims: CompAim[];
  user$: Observable<User> = this.store.select(getUser);

  // variables for subscription
  selectedBar: Bar;
  currentUnit: string;
  semester: string;
  view: string;

  @Output() clickBar = new EventEmitter<number>();

  // declare global variables of the bar chart
  margin = { top: 20, right: 40, bottom: 100, left: 40 };
  svgHeight = 700;
  svgWidth = 700;
  contentWidth: number = this.svgWidth - this.margin.left - this.margin.right;
  contentHeight: number = this.svgHeight - this.margin.top - this.margin.bottom;
  legendPosition: string = `translate(${this.margin.left * 2}, ${
    this.svgWidth - this.margin.bottom / 2
  })`;
  barWidth = 70;
  xScale: any;
  yScale: any;
  xKoord: any;
  yKoord: any;

  ngOnInit() {
    // store select for chart
    this.store.select(getSelectedBar).subscribe((selectedBar) => {
      if (selectedBar) {
        this.selectedBar = selectedBar;
      }
    });
    this.semester$.subscribe((sem) => (this.semester = sem));
    this.view$.subscribe((view) => (this.view = view));
    // subscribe to competence aims
    this.user$.subscribe(user => {
      if (user.compAims) {
        this.compAims = user.compAims;
        this.assignAimsToBars();
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.competences.length != 0) {
      this.competences = this.competences.filter(
        (competence) => competence.parentId === '' || !competence.parentId
      );
      this.unit$.subscribe((unit) => {
        if (this.currentUnit !== unit) {
          // update bars if unit is changed to adapt changes in bar height
          this.updateBars();
        }
        this.currentUnit = unit;
        this.createAxis(this.competences);
      });
    }

    // if competences or courses change reset bars
    if (changes.courses || changes.competences) {
      this.updateBars();
    }
  }

  private updateBars() {
    if (this.competences && this.courses && this.view && this.semester) {
      this.store.dispatch(
        setBars({
          competences: this.competences,
          selectedCourses: this.courses,
          view: this.view,
          semester: this.semester,
        })
      );
      this.assignAimsToBars();
    }
  }

  assignAimsToBars() {
    if (this.compAims && this.bars) {
      // assign aims to bars
      for (let bar of this.bars) {
        const aim = this.compAims.find(
          (compAim) => compAim.compId == bar.competence.compId
        );
        if (aim) {
          bar.aim = aim.aim;
        }
      }
    }
  }

  private createAxis(comp: Competence[]) {
    // sets the highest value for yScale
    let topValue = 10;
    // if bars exist, check if there is a value higher than topValue
    if (this.bars) {
      const max = this.bars
        .map((el) => {
          if(el.aim) {
            return el.aim > el.fulfillment ? el.aim : el.fulfillment
          } else {
            return el.fulfillment;
          }
        })
        .reduce((pv, cv) => (pv > cv ? pv : cv));
      topValue = max > topValue ? Math.round(max + 2) : topValue;
    }
    if (comp !== undefined) {
      // set Viewbox
      d3.select('#bar-chart svg')
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('viewBox', '0 0 ' + this.svgWidth + ' ' + this.svgHeight);

      // delete existing Axis
      d3.select('#axis').remove();

      // select g inside svg and save as variable
      const g = d3
        .select('#bar-chart svg g')
        .append('g')
        .attr('transform', `translate(${this.margin.left},0)`)
        .attr('id', 'axis');

      // set the x and y Scale
      // if description lenght too long shorten it
      this.xScale = d3
        .scaleBand()
        .rangeRound([0, this.contentWidth])
        .domain(
          this.competences.map((d) => {
            if (d.name.length > 20) {
              if (d.short.length < 13) {
                return d.short;
              } else {
                return d.short.slice(0, 10) + '...';
              }
            } else {
              return d.name;
            }
          })
        );

      this.yScale = d3
        .scaleLinear()
        .domain([0, topValue])
        .rangeRound([this.contentHeight, 0]);

      // set coordinates of the bars
      let multiplicator = this.bars ? this.bars.length : 0;
      this.xKoord = (i: number) =>
        this.contentWidth / (multiplicator * 2) +
        (this.contentWidth / multiplicator) * i -
        this.barWidth / 2 +
        this.margin.left;
      this.yKoord = (d: number) => {
        return this.yScale(d);
      };

      // append two groups to g one for xAxis and one for yAxis
      // Code for x axis
      g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + this.contentHeight + ')')
        .call(d3.axisBottom(this.xScale));

      // Code for y axis
      g.append('g')
        .attr('class', 'axis axis--y')
        .call(
          d3
            .axisLeft(this.yScale)
            .tickFormat((d, i) => d + ' ' + this.currentUnit.toUpperCase())
        )
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('Frequency');

      g.selectAll('text').style('font-size', '1.7em');
    }
  }

  handleClick(index: number) {
    this.store.dispatch(selectBar({ index }));
  }
}
