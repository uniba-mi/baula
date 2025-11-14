import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { Competence, Fulfillment } from '../../../../../../interfaces/competence';
import { Standard } from '../../bilapp/interfaces/standard';
import { CompetenceFormData } from '../interfaces/form-data';
import { PublicRestService } from '../public-rest.service';

interface FormError {
  name: string,
  desc: string
}

@Component({
    selector: 'uh-competence-form',
    templateUrl: './competence-form.component.html',
    styleUrls: ['./competence-form.component.scss'],
    standalone: false
})
export class CompetenceFormComponent implements OnInit, OnChanges {
  @Input() fulfillments: Fulfillment[];
  @Output() submitCompetences = new EventEmitter<CompetenceFormData>();
  competences$: Observable<Competence[]>;
  standards: Standard[];
  standards$: Observable<Standard[]>;
  //fulfillment: Fulfillment[] = [];
  errors: FormError[] = [];
  removeMissingEntryError: boolean = false;

  competenceSums: Number[];
  sumColor: string[] = new Array(3).fill('black');
  constructor(private rest: PublicRestService) { }

  async ngOnInit() {
    this.competences$ = this.rest.getCompetences();
    this.standards$ = this.rest.getStandards();
    this.standards = await firstValueFrom(this.rest.getStandards());
    this.competenceSums = new Array(this.standards.length).fill(0)
    this.sumColor = new Array(this.standards.length).fill('black')
    this.competences$.subscribe(comp => {
      for(let c of comp) {
        this.fulfillments.push({
          compId: c.compId,
          fulfillment: 0
        })
      }
    })
    // init changeData
    this.changeData();
  }

  ngOnChanges(changes: SimpleChanges): void {
      if(changes.fulfillments && this.standards) {
        this.changeData();
      }
  }

  changeData() {
    this.caluclateSum();

    this.submitCompetences.emit({
      invalid: this.validateFormData(),
      fulfillments: this.fulfillments
    });
  }

  caluclateSum() {
    const keys = this.standards.map(standard => standard.stId);
    let index = 0;
    for(const key of keys) {
      let compFulfillments = this.fulfillments.filter(ful => ful.compId.startsWith(key));
      let array = compFulfillments.map(comp => comp.fulfillment);
      let sum = array.reduce((pv, cv) => pv + cv, 0);
      if (sum > 100) {
        this.sumColor[index] = 'red'
      } else {
        this.sumColor[index] = 'black'
      }
      this.competenceSums[index] = sum;
      index++;
    }
  }

  validateFormData(): boolean {
    const sums = this.competenceSums;
    // reset errors
    this.errors = [];
    let invalid = false;
    // check sums
    for(let sum of sums) {
      if(+sum <= 0 && !this.errors.find(el => el.name == 'Fehlende Eingaben') && !this.removeMissingEntryError) {
        this.errors.push({
          name: "Fehlende Eingaben",
          desc: `Zu mindestens einem Standard fehlen Angaben. Bitte ergänzen Sie diese noch.`
        });
        invalid = true;
      } else if (+sum > 100 && !this.errors.find(el => el.name == 'Summe größer als 100%')) {
        this.errors.push({
          name: "Summe größer als 100%",
          desc: `In mindestens einem Standard haben Sie mehr als 100% vergeben. Das ist nicht möglich, bitte passen Sie ihre Änderungen an.`
        });
        invalid = true;
      }
    }
    if(this.errors.length == 0) {
      invalid = false;
    }
    return invalid;
  }

  removeAlert() {
    this.removeMissingEntryError = true;
    this.changeData();
  }

  standardizeFulfillments() {
    for(let [i, sum] of this.competenceSums.entries()) {
      // identify standards where fulfillment is over 100
      if(+sum > 100) {
        let multiplicator = 100 / Number(sum);
        let stId = this.standards[i].stId;
        // standardize fulfillments 
        for(let entry of this.fulfillments.filter(el => el.compId.startsWith(stId) && el.fulfillment !== 0)) {
          // round result to integer
          entry.fulfillment = Math.round(entry.fulfillment * multiplicator);
        }
      }
    }
    this.changeData();
  }
}
