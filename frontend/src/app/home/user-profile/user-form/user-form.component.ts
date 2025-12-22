import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { User } from '../../../../../../interfaces/user';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, catchError, firstValueFrom, map, of, take } from 'rxjs';
import { Semester } from '../../../../../../interfaces/semester';
import { StudyProgramme } from '../../../../../../interfaces/study-programme';
import { ModuleHandbook } from '../../../../../../interfaces/module-handbook';
import { RestService } from 'src/app/rest.service';
import { Store } from '@ngrx/store';
import { ModuleHandbookActions } from 'src/app/actions/module-overview.actions';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  standalone: false,
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() user: User;
  @Input() isEdit: boolean = false; // if is edit (= update profile) semester should not be editable
  @Output() submitUser = new EventEmitter<User>();

  userForm: FormGroup;
  selectedModuleHandbook = new FormControl();
  selectedStartSemester = new FormControl();
  selectedSpName = new FormControl();
  selectedSpVersion = new FormControl();
  selectedStudyprogramme: StudyProgramme | undefined;
  studyprogrammes$: Observable<StudyProgramme[]>;
  duration: string;
  maxEcts: string;
  fulltime: boolean;
  startSemesters: Semester[];

  /****Important: *** 
  Currently we use the names and desc as keys, since they are readable to user as unique as the spId and poVersion.
  This might be a future bug, if this assumption becomes wrong.
  *********/
  spNames: string[];
  spVersions$: Observable<any[]>;
  possiblePOs$: Observable<StudyProgramme[]>;
  bachelors: string[];
  masters: string[];
  teacherEducation: string[];
  others: string[];

  constructor(
    private rest: RestService,
    private formBuilder: FormBuilder,
    private store: Store,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // fallback is current semester
    this.selectedStartSemester = new FormControl(
      this.user?.startSemester ? this.user.startSemester : new Semester().name
    );

    this.startSemesters = this.returnInitialSemesterList();
    this.userForm = this.formBuilder.group({
      spName: this.selectedSpName ? this.selectedSpName : '',
      spVersion: this.selectedSpVersion ? this.selectedSpVersion : '',
      mhb: this.selectedModuleHandbook ? this.selectedModuleHandbook : '',
      semester: this.selectedStartSemester ? this.selectedStartSemester : '',
      duration: [
        this.user.duration ? this.user.duration : '',
        {
          validators: [
            Validators.required,
            Validators.min(3),
            Validators.max(20),
          ],
        },
      ],
      ects: [
        this.user.maxEcts ? this.user.maxEcts : '',
        {
          validators: [
            Validators.required,
            Validators.min(1),
            Validators.max(300),
          ],
        },
      ],
      fulltime: [
        this.user.fulltime,
        {
          validatores: [Validators.required],
        },
      ],
    });

    // set the disabled state for semester based on isEdit
    if (this.isEdit) {
      this.userForm.controls['semester'].disable(); // semester not editable
    } else {
      this.userForm.controls['semester'].enable();
    }

    // for new users to add the semester value to the user object that is emitted to the parent component
    this.user.startSemester = this.userForm.controls['semester'].value;

    this.studyprogrammes$ = this.rest.getStudyprogrammes().pipe(
      catchError((error) => {
        this.auth.forceReload(error);
        return of([]); // Return an empty array or handle the error as needed
      })
    );

    if (
      this.user.sps &&
      this.user.sps.length !== 0 &&
      this.user.startSemester
    ) {
      this.patchStudyprogramme(this.user);
      this.selectedStartSemester.setValue(this.user.startSemester);
    }

    this.rest
      .getStudyprogrammes()
      .pipe(
        map((sps) => sps.map((el) => el.name)),
        map((names) => [...new Set(names)]),
        take(1)
      )
      .subscribe((names) => {
        this.spNames = names;
        this.bachelors = names.filter((el) => el.startsWith('Bachelor'));
        this.masters = names.filter((el) => el.startsWith('Master'));
        this.teacherEducation = names.filter((el) => el.startsWith('Lehramt'));
        this.others = names.filter(
          (el) =>
            !el.startsWith('Bachelor') &&
            !el.startsWith('Master') &&
            !el.startsWith('Lehramt')
        );
      });
  }

  ngOnChanges() {
    // get user value and patch user data into form
    if (
      this.user.sps &&
      this.user.sps.length !== 0 &&
      this.user.startSemester &&
      this.studyprogrammes$
    ) {
      this.patchStudyprogramme(this.user);
      this.selectedStartSemester.setValue(this.user.startSemester);
      if (this.user.maxEcts && this.user.duration) {
        this.userForm.controls['duration'].patchValue(this.user.duration);
        this.userForm.controls['ects'].patchValue(this.user.maxEcts);
      }
    }
  }

  private returnInitialSemesterList(): Semester[] {
    const semester = new Semester('2018w');
    const year = new Date().getFullYear();
    return semester.getSemesterList((year - 2018) * 2 + 1).reverse();
  }

  selectSpName(name: string) {
    this.userForm.controls['spName'].addValidators([Validators.required]);
    this.possiblePOs$ = this.studyprogrammes$.pipe(
      map((sps) => sps.filter((el) => el.name == name))
    );

    this.spVersions$ = this.possiblePOs$.pipe(
      map((sps) => sps.map((el) => el.desc))
    );

    this.presetStudyprogramme(name);
  }

  // function to preset the poversion and the module handbook
  private presetStudyprogramme(name: string) {
    // get semesterdate to preselect poVersion and mhb
    const semesterDate = this.selectedStartSemester.value
      ? new Semester(this.selectedStartSemester.value).semesterDate
      : new Date();

    // iterate over possible pos -> filtered by spName
    this.possiblePOs$.pipe(take(1)).subscribe((pos) => {
      // preset duration and ects
      this.presetDurationAndEcts(name);
      // preselect poVersion by date
      if (pos.length > 1) {
        // preselection only necessary, if more than one exists
        // transform DD.MM.YYYY into Date for distance calculation
        const dates = pos.map((el) => {
          const date = el.date.split('.');
          return new Date(`${date[2]}/${date[1]}/${date[0]}`);
        });
        // saves indexes with smallest distance and generate array with possible pos
        const idx = this.getIndexWithSmallestDistance(dates, semesterDate);
        const selectedPos = idx.map((index) => pos[index]);

        // select po with the highest version (should be the newest)
        const highestPoVersion = Math.max(
          ...selectedPos.map((el) => el.poVersion)
        );

        this.selectedStudyprogramme = pos.find(
          (el) => el.poVersion === highestPoVersion
        );
      } else {
        this.selectedStudyprogramme = pos[0];
      }

      // select studyprogramme
      if (this.selectedStudyprogramme) {
        this.selectedSpVersion.setValue(this.selectedStudyprogramme.desc);
        this.user.sps = [
          {
            spId: this.selectedStudyprogramme.spId,
            poVersion: this.selectedStudyprogramme.poVersion,
            name: this.selectedStudyprogramme.name,
            faculty: this.selectedStudyprogramme.faculty,
            mhbId: '',
            mhbVersion: 0,
          },
        ];
        // preselect mhb
        if (this.selectedStudyprogramme.mhbs) {
          this.preselectModuleHandbook(this.selectedStudyprogramme.mhbs, name);
        }
      }
    });
  }

  private preselectModuleHandbook(mhbs: ModuleHandbook[], spName: string) {
    // set default for selected mhb
    let selectedModuleHandbook = mhbs[0];
    if (mhbs.length != 1) {
      // set programmetype and semesterdate for further selection of most appropriate mhb
      const programmeType = spName.startsWith('Bachelor')
        ? 'Bachelor'
        : spName.startsWith('Master')
        ? 'Master'
        : 'Lehramt';
      const semesterDate = new Semester().semesterDate;

      // transform semester strings into Date
      const dates = mhbs.map((el) => {
        let semesterString = '';
        if (el.semester.startsWith('Winter')) {
          semesterString = `${el.semester.slice(-9, -5)}w`;
        } else {
          semesterString = `${el.semester.slice(-4)}s`;
        }
        return new Semester(semesterString).semesterDate;
      });

      // saves indexes with smallest distance and generate array with possible mhbs
      const idx = this.getIndexWithSmallestDistance(dates, semesterDate);
      let possibleMhbs = idx.map((index) => mhbs[index]);

      // if more than one mhb is possible prefilter handbooks by programmeType
      if (possibleMhbs.length > 1) {
        possibleMhbs = possibleMhbs.filter((el) =>
          el.name.startsWith(programmeType)
        );
      }

      // if filtering leads to empty modulhandbook -> name of handbook does not start with programmeType -> if case happens, just take the first of the nearest mhbs
      if (possibleMhbs.length !== 0) {
        selectedModuleHandbook = possibleMhbs[0];
      } else if (idx.length !== 0) {
        selectedModuleHandbook = mhbs[idx[0]];
      } else {
        selectedModuleHandbook = mhbs[0];
      }
    }
    this.selectModuleHandbook(selectedModuleHandbook);
  }

  private presetDurationAndEcts(spName: string) {
    if (spName.toLowerCase().includes('bachelor')) {
      this.userForm.controls['duration'].setValue(6);
      this.user.duration = 6;
      this.userForm.controls['ects'].setValue(180);
      this.user.maxEcts = 180;
    } else if (spName.toLowerCase().includes('master')) {
      this.userForm.controls['duration'].setValue(4);
      this.user.duration = 4;
      this.userForm.controls['ects'].setValue(120);
      this.user.maxEcts = 120;
    }
  }

  async selectStudyprogramme(version: string) {
    this.userForm.controls['spVersion'].addValidators([Validators.required]);
    const spName = this.userForm.controls['spName'].value;
    const studyprogrammes = await firstValueFrom(this.studyprogrammes$);
    // find studyprogramme
    this.selectedStudyprogramme = studyprogrammes.find(
      (el) => el.desc == version && el.name == spName
    );
    if (this.selectedStudyprogramme) {
      this.user.sps = [
        {
          spId: this.selectedStudyprogramme.spId,
          poVersion: this.selectedStudyprogramme.poVersion,
          name: this.selectedStudyprogramme.name,
          faculty: this.selectedStudyprogramme.faculty,
          mhbId: '',
          mhbVersion: 0,
        },
      ];
      // preselect mhb
      if (this.selectedStudyprogramme.mhbs) {
        this.preselectModuleHandbook(
          this.selectedStudyprogramme.mhbs,
          this.selectedStudyprogramme.name
        );
      }
    }
  }

  async patchStudyprogramme(user: User) {
    const studyprogrammes = await firstValueFrom(this.studyprogrammes$);
    // find studyprogramme
    if (user.sps && user.sps.length !== 0) {
      const spFromUser = user.sps[0];
      const studyprogramme = studyprogrammes.find((el) => {
        return (
          el.spId == spFromUser.spId && el.poVersion == spFromUser.poVersion
        );
      });
      if (studyprogramme) {
        this.possiblePOs$ = of(
          studyprogrammes.filter((el) => el.name == studyprogramme.name)
        );

        this.spVersions$ = this.possiblePOs$.pipe(
          map((sps) => sps.map((el) => el.desc))
        );

        // set studyprogramme value
        this.selectedSpName.setValue(studyprogramme.name);
        // trigger function to set spVersion
        this.userForm.controls['spName'].setValue(studyprogramme.name);
        this.selectedSpVersion.setValue(studyprogramme.desc);
        this.userForm.controls['spVersion'].setValue(studyprogramme.desc);
        this.selectedStudyprogramme = studyprogramme;
        const moduleHandbook = studyprogramme.mhbs?.find((el) => {
          return (
            el.mhbId == spFromUser.mhbId && el.version == spFromUser.mhbVersion
          );
        });
        if (moduleHandbook) {
          if (this.user.sps && this.user.sps.length !== 0) {
            this.user.sps[0].mhbId = moduleHandbook.mhbId;
            this.user.sps[0].mhbVersion = moduleHandbook.version;
          }
          this.selectedModuleHandbook.setValue(moduleHandbook);
        }
      }
    }
  }

  // TODO: Currently only the first entry, where the smallest Distance occurs is returned, this may lead to a wrong selection!
  private getIndexWithSmallestDistance(
    dateArray: Date[],
    targedDate: Date
  ): number[] {
    const distance = dateArray.map((el) => {
      return Math.abs(targedDate.valueOf() - el.valueOf());
    });
    const smallestDistance = Math.min(...distance);
    let idx = [];
    for (let index in distance) {
      if (distance[index] == smallestDistance) {
        idx.push(Number(index));
      }
    }
    return idx;
  }

  selectModuleHandbook(mhb: ModuleHandbook) {
    this.userForm.controls['mhb'].addValidators([Validators.required]);
    if (this.user.sps && this.user.sps.length !== 0) {
      this.user.sps[0].mhbId = mhb.mhbId;
      this.user.sps[0].mhbVersion = mhb.version;
      this.selectedModuleHandbook.setValue(mhb);
      this.store.dispatch(
        ModuleHandbookActions.loadModuleHandbook({
          id: mhb.mhbId,
          version: mhb.version,
        })
      );
      this.emitChanges();
    }
  }

  selectStartSemester() {
    this.userForm.controls['semester'].addValidators([Validators.required]);
    this.user.startSemester = this.userForm.controls['semester'].value;
    this.emitChanges();
  }

  updateDuration() {
    this.user.duration = this.userForm.controls['duration'].value;
    this.emitChanges();
  }

  updateEcts() {
    this.user.maxEcts = this.userForm.controls['ects'].value;
    this.emitChanges();
  }

  updateFulltime() {
    this.user.fulltime = this.userForm.controls['fulltime'].value;
    this.emitChanges();
  }

  emitChanges() {
    if (this.user.sps && this.user.sps.length !== 0) {
      this.submitUser.emit(this.user);
    }
  }
}
