import { Component, inject, model, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { Subscription, take } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LongTermEvaluation } from '../../../../../../interfaces/long-term-evaluation';
import { LteRestService } from '../lte-rest.service';
import { PrivacyStatementComponent } from '../privacy-statement/privacy-statement.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'lte-survey',
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatStepperModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatCardModule,
    FormsModule,
    MatIconModule,
    MatCheckboxModule,
    PrivacyStatementComponent,
    MatTooltipModule
  ],
  providers: [LteRestService],
})
export class SurveyComponent implements OnInit, OnDestroy {
  data: { evaluationCode: string; spName: string; semester: number, consentGiven: boolean | undefined } = inject(MAT_DIALOG_DATA);
  private api = inject(LteRestService);
  readonly dismiss = model(false);
  likertScale = [
    'Stimme überhaupt nicht zu',
    'Stimme nicht zu',
    'Stimme eher nicht zu',
    'Weder noch',
    'Stimme eher zu',
    'Stimme zu',
    'Stimme vollkommen zu',
  ];
  view: 'intro' | 'survey' = 'intro';
  puLikertQuestions = [
    {
      id: 'pu1',
      text: 'Die Nutzung von Baula verbessert meine Studienplanung.',
    },
    {
      id: 'pu2',
      text: 'Mit Baula kann ich meine Studienplanung produktiver gestalten.',
    },
    {
      id: 'pu3',
      text: 'Baula macht meine Studienplanung insgesamt effizienter.',
    },
    {
      id: 'pu4',
      text: 'Insgesamt ist Baula für meine Studienplanung nützlich.',
    },
    
  ];
  peouLikertQuestions = [
    {
      id: 'peou1',
      text: 'Die Bedienung von Baula ist für mich klar und verständlich.',
    },
    {
      id: 'peou2',
      text: 'Der Umgang mit Baula fällt mir ohne großen Aufwand leicht.',
    },
    {
      id: 'peou3',
      text: 'Ich finde Baula insgesamt einfach zu bedienen.',
    },
    {
      id: 'peou4',
      text: 'Es ist für mich unkompliziert, Baula so zu nutzen, wie ich es möchte.',
    }
  ];
  biLikertQuestion = {
      id: 'bi',
      text: 'Ich habe vor, Baula auch in den kommenden Semestern zu nutzen.',
  }
  
  isLargeScreen: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<SurveyComponent>,
    private screenSizeService: ScreenSizeService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.screenSizeService.isLargeScreen$.subscribe((isLargeScreen) => {
        this.isLargeScreen = isLargeScreen;
      })
    );
  }

  private _formBuilder = inject(FormBuilder);
  consent = new FormControl(null, [
    Validators.required,
    this.booleanTrueValidator(),
  ]);
  personalCodeForm = this._formBuilder.group({
    code1: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
        Validators.pattern(/[a-zA-Z]{2}/),
      ],
    ],
    code2: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
        Validators.pattern(/[a-zA-Z]{2}/),
      ],
    ],
    code3: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
        Validators.pattern(/\d{2}/),
      ],
    ],
    code4: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
        Validators.pattern(/[a-zA-Z]{2}/),
      ],
    ],
  });
  surveyForm = this._formBuilder.group({
    pu1: [null, Validators.required],
    pu2: [null, Validators.required],
    pu3: [null, Validators.required],
    pu4: [null, Validators.required],
    peou1: [null, Validators.required],
    peou2: [null, Validators.required],
    peou3: [null, Validators.required],
    peou4: [null, Validators.required],
    bi: [null, Validators.required],
    use: [' ', Validators.required],
    nps: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
    feedback: ['', Validators.maxLength(1000)],
  });

  changeView(view: 'survey' | 'intro') {
    this.view = view;
  }

  onSubmit() {
    if (this.surveyForm.valid) {
      const code1 = this.personalCodeForm.value.code1;
      const code2 = this.personalCodeForm.value.code2;
      const code3 = this.personalCodeForm.value.code3;
      const code4 = this.personalCodeForm.value.code4;
      const personalCode = `${code1}${code2}${code3}${code4}`.toLowerCase();
      const result: LongTermEvaluation = {
        personalCode,
        evaluationCode: this.data.evaluationCode,
        spName: this.data.spName,
        semester: this.data.semester,
        pu: [
          this.surveyForm.value.pu1 ?? 0,
          this.surveyForm.value.pu2 ?? 0,
          this.surveyForm.value.pu3 ?? 0,
          this.surveyForm.value.pu4 ?? 0,
        ],
        peou: [
          this.surveyForm.value.peou1 ?? 0,
          this.surveyForm.value.peou2 ?? 0,
          this.surveyForm.value.peou3 ?? 0,
          this.surveyForm.value.peou4 ?? 0,
        ],
        bi: this.surveyForm.value.bi ?? 0,
        use: this.surveyForm.value.use ?? '',
        nps: this.surveyForm.value.nps ?? 0,
        feedback: this.surveyForm.value.feedback ?? '',
      };
      // save result to database
      this.api
        .saveResult(result)
        .pipe(take(1))
        .subscribe({
          next: () => {
            console.log('Eintrag in Datenbank gespeichert!');
            this.dialogRef.close(result);
          },
          error: (error) => {
            console.log(error);
            this.dialogRef.close(result);
          }
        });
    }
  }

  private booleanTrueValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === true ? null : { notTrue: true };
    };
  }

  get npsValue(): number | null {
    return this.surveyForm.get('nps')?.value ?? null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
