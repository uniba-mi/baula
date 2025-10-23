import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Semester } from '../../../../../../../interfaces/semester';

@Component({
  selector: 'admin-semester-selection-form',
  standalone: false,
  templateUrl: './semester-selection-form.component.html',
  styleUrl: './semester-selection-form.component.scss'
})
export class SemesterSelectionFormComponent implements OnInit {
  @Output() semesterChange: EventEmitter<string> = new EventEmitter<string>();
  semesterList: Semester[] = new Semester('2022s').getSemesterList(10);
  selectedSemester: string;

  ngOnInit(): void {
    this.selectedSemester = new Semester().name;
    this.semesterChange.emit(this.selectedSemester);
  }

  // selection of semester to show only the modules offered in the selected semester
  selectSemester() {
    this.semesterChange.emit(this.selectedSemester);
  }
}
