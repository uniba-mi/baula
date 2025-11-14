import { Component, OnInit } from '@angular/core';
import { RestService } from 'src/app/rest.service';
import { Observable, take } from 'rxjs';
import { AcademicDate } from '../../../../../../interfaces/academic-date';
import { Store } from '@ngrx/store';
import { getActiveSemester } from 'src/app/selectors/study-planning.selectors';

@Component({
    selector: 'app-semester-dates',
    templateUrl: './semester-dates.component.html',
    styleUrl: './semester-dates.component.scss',
    standalone: false
})
export class SemesterDatesComponent implements OnInit {
  academicDates$: Observable<AcademicDate[]>;
  expandedPeriods: Set<number> = new Set<number>(); // stores past periods id for expansion
  activePeriods: AcademicDate[] = [];
  pastPeriods: AcademicDate[] = [];
  today: Date = new Date();
  pastPeriodsExpanded: boolean = false;

  constructor(private rest: RestService, private store: Store) { }

  ngOnInit(): void {
    this.store.select(getActiveSemester).subscribe(semester => {
      if (semester) {
        this.academicDates$ = this.rest.getAcademicDatesOfSemester(semester);

        // Subscribe to academic dates and filter both active and past periods
        this.academicDates$.subscribe((dates: AcademicDate[]) => {
          this.activePeriods = dates.filter(date =>
            !this.isPeriodOver(date) && date.dateType.typeId !== 6
          );
          this.pastPeriods = dates.filter(date =>
            this.isPeriodOver(date) && date.dateType.typeId !== 6
          );
        });
      }
    });
  }

  // toggle past periods
  togglePastPeriods(): void {
    this.pastPeriodsExpanded = !this.pastPeriodsExpanded;
  }

  // calculate days between dates
  calculateDaysBetween(startDate: Date, endDate: Date): number {
    const oneDay = 1000 * 60 * 60 * 24; // milliseconds in one day for JS
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const differenceInTime = end - start;
    return Math.floor(differenceInTime / oneDay);
  }

  // check if date is within period
  isWithinPeriod(date: AcademicDate): boolean {
    const startDate = new Date(date.startdate);
    const endDate = new Date(date.enddate);

    return this.today >= startDate && this.today <= endDate;
  }

  // check if period has ended
  isPeriodOver(date: AcademicDate): boolean {
    const endDate = new Date(date.enddate);
    return this.today > endDate;
  }

  // Calculate days remaining until the start or end date
  calculateDaysRemaining(date: AcademicDate): number {
    const endDate = new Date(date.enddate);
    const startDate = new Date(date.startdate);

    // if within period calculate days until the end
    if (this.isWithinPeriod(date)) {
      return this.calculateDaysBetween(this.today, endDate);
    }

    // else calculate days until start
    return this.calculateDaysBetween(this.today, startDate);
  }

  // generate countdown message based on the current state
  getCountdownMessage(date: AcademicDate): string {
    const startDate = new Date(date.startdate);
    const endDate = new Date(date.enddate);

    const daysToStart = this.calculateDaysBetween(this.today, startDate);
    const daysToEnd = this.calculateDaysBetween(this.today, endDate);

    const pluralize = (count: number) => count === 1 ? 'Tag' : 'Tagen';

    if (daysToStart > 0) {
      return `beginnt in ${daysToStart} ${pluralize(daysToStart)}`;
    } else if (daysToEnd > 0 && this.isWithinPeriod(date)) {
      return `endet in ${daysToEnd} ${pluralize(daysToEnd)}`;
    } else {
      return `abgeschlossen`;
    }
  }

  // style red if 3 or less days left
  getCountdownClass(date: AcademicDate): string {
    const daysRemaining = this.calculateDaysRemaining(date);
    return daysRemaining <= 3 ? 'text-danger' : '';
  }

  // toggle expansion for past periods
  toggleExpand(date: AcademicDate): void {
    if (this.expandedPeriods.has(date.dateType.typeId)) {
      this.expandedPeriods.delete(date.dateType.typeId);
    } else {
      this.expandedPeriods.add(date.dateType.typeId);
    }
  }

  // is period expanded
  isExpanded(date: AcademicDate): boolean {
    return this.expandedPeriods.has(date.dateType.typeId);
  }
}
