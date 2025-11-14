import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { Semester } from '../../../../../interfaces/semester';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';
import { getActiveSemester } from 'src/app/selectors/study-planning.selectors';

@Component({
  selector: 'app-select-semester-dialog',
  templateUrl: './select-semester-dialog.component.html',
  styleUrl: './select-semester-dialog.component.scss',
  standalone: false
})

// to use in multi mode (multi semester select) specify mode='multi'
export class SelectSemesterDialogComponent {
  @Input() semesters$: Observable<Semester[]> | undefined;
  @Input() mode: string | undefined;
  selectedSemester = new FormControl('');
  selectedSemesters = new FormControl<string[]>([]);
  semesterForm: FormGroup;
  activeSemester: string;
  allSemesters: Semester[] = [];

  constructor(private store: Store, private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initForm();
    if (this.semesters$) {
      if (!this.isMultiMode()) {
        this.semesters$ = this.semesters$.pipe(
          map(semesters => semesters.filter(semester => !semester.isPastSemester()))
        );
      }

      // for multiselect
      this.semesters$.pipe(take(1)).subscribe(semesters => {
        this.allSemesters = semesters;
        this.cdr.detectChanges();
      });
    }

    this.store.select(getActiveSemester).pipe(take(1)).subscribe(semester => {
      this.activeSemester = semester;
      this.cdr.detectChanges();
    });
  }

  initForm(): void {
    this.semesterForm = this.formBuilder.group({
      semester: this.selectedSemester,
      semesters: this.selectedSemesters
    });
  }

  isMultiMode(): boolean {
    return this.mode === 'multi';
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }

  getSemester() {
    if (this.semesterForm.valid) {
      if (this.isMultiMode()) {
        return this.selectedSemesters.value || undefined
      } else {
        return this.selectedSemester.value || undefined;
      }
    } else {
      return;
    }
  }

  toggleSelectAll(): void {
    const currentSelection = this.selectedSemesters.value || [];
    const allSemesterNames = this.allSemesters.map(s => s.name);

    if (currentSelection.length === allSemesterNames.length) {
      this.selectedSemesters.setValue([]);
    } else {
      this.selectedSemesters.setValue(allSemesterNames);
    }
  }

  isValidSelection(): boolean {
    if (this.isMultiMode()) {
      const selectedSemesters = this.selectedSemesters.value || [];
      return selectedSemesters.length > 0;
    } else {
      return this.selectedSemester.valid;
    }
  }

  isAllSelected(): boolean {
    const currentSelection = this.selectedSemesters.value || [];
    return currentSelection.length === this.allSemesters.length && this.allSemesters.length > 0;
  }

  isIndeterminate(): boolean {
    const currentSelection = this.selectedSemesters.value || [];
    return currentSelection.length > 0 && currentSelection.length < this.allSemesters.length;
  }
}
