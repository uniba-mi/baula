import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Semester } from '../../../../../interfaces/semester';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { RestService } from 'src/app/rest.service';
import { AcademicDate } from '../../../../../interfaces/academic-date';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { TimetableActions } from 'src/app/actions/study-planning.actions';

@Component({
    selector: 'app-edit-semester-dialog',
    templateUrl: './edit-semester-dialog.component.html',
    styleUrls: ['./edit-semester-dialog.component.scss'],
    standalone: false
})
export class EditSemesterDialogComponent implements OnInit {
  @Input() semesters$: Observable<Semester[]>;
  @Input() currentSemester: string | null;
  @Output() semesterChanged = new EventEmitter<string>();

  selectedSemester = new FormControl('')
  hasDefinedTeachingPeriod = false;
  originalSemester: string | null = null;  // original semester save

  constructor(private store: Store<State>, private rest: RestService, private snackbar: SnackbarService) { }

  ngOnInit(): void {
    this.originalSemester = this.currentSemester;
    this.selectedSemester.patchValue(this.currentSemester)
  }

  updateSemester() {
    const selectedValue = this.selectedSemester.value;

    if (typeof selectedValue === 'string' && selectedValue) {
      this.rest.getAcademicDatesOfSemester(selectedValue).subscribe((dates: AcademicDate[]) => {
        if (dates) {
          const teachingPeriod = dates.find(date => date.dateType.name.includes('Vorlesungszeit'));
          if (teachingPeriod) {
            this.hasDefinedTeachingPeriod = true;
          } else {
            this.snackbar.openSnackBar({
              type: AlertType.WARNING,
              message: 'Ansicht kann noch nicht geöffnet werden - keine Vorlesungszeiten vorhanden.',
            });
            this.hasDefinedTeachingPeriod = false;
          }
        } else {
          this.hasDefinedTeachingPeriod = false;
        }
      });
    } else {
      this.hasDefinedTeachingPeriod = false;
    }
  }

  // save new semester
  saveSemester(): void {
    const selectedValue = this.selectedSemester.value;
    if (this.hasDefinedTeachingPeriod && selectedValue) {
      this.store.dispatch(TimetableActions.updateActiveSemester({ semester: selectedValue }));
      this.originalSemester = selectedValue; // update original semester
      this.semesterChanged.emit(selectedValue);
    }
  }

  cancel(): void {
    // restore original semester
    this.selectedSemester.patchValue(this.originalSemester);
  }
}
