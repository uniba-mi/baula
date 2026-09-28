import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { Semester } from '@interfaces/semester';

@Component({
  selector: 'admin-semester-selection-form',
  standalone: false,
  templateUrl: './semester-selection-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './semester-selection-form.component.scss'
})
export class SemesterSelectionFormComponent implements OnInit {
  // number of semesters the selection reaches into the past and the future
  private static readonly PAST_SEMESTERS = 6;
  private static readonly FUTURE_SEMESTERS = 10;

  // lets the host block the selection while it is loading data
  @Input() disabled = false;
  @Output() semesterChange: EventEmitter<string> = new EventEmitter<string>();
  semesterList: Semester[] = [];
  selectedSemester: string;

  ngOnInit(): void {
    const current = new Semester();
    // window around the current semester, so that past and upcoming semesters stay selectable
    let start = current;
    for (let i = 0; i < SemesterSelectionFormComponent.PAST_SEMESTERS; i++) {
      start = start.getPreviousSemester(start);
    }
    this.semesterList = start.getSemesterList(
      SemesterSelectionFormComponent.PAST_SEMESTERS +
        SemesterSelectionFormComponent.FUTURE_SEMESTERS +
        1,
    );
    this.selectedSemester = current.name;
    this.semesterChange.emit(this.selectedSemester);
  }

  // selection of semester to show only the modules offered in the selected semester
  selectSemester() {
    this.semesterChange.emit(this.selectedSemester);
  }
}
