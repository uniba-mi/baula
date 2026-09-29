import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { Standard } from '../../bilapp/interfaces/standard';
import { BilappRestService } from '../../bilapp/bilapp-rest.service';
import { Observable } from 'rxjs';
import { Competence } from '../../../../../../interfaces/competence';
import { map } from 'rxjs/operators';
import { CompAim } from '../../../../../../interfaces/user';

@Component({
  selector: 'app-competence-tab',
  templateUrl: './competence-tab.component.html',
  styleUrls: ['./competence-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CompetenceTabComponent implements OnInit {
  private rest = inject(BilappRestService);

  @Input() standard: Standard; // standard needed to filter competences and query competence groups
  @Output() update = new EventEmitter<CompAim>(); // just for transit on the way to parent
  competences$: Observable<Competence[]>;
  compGroups$: Observable<Competence[]>;

  ngOnInit(): void {
    if (this.standard) {
      // query competence groups from api
      this.compGroups$ = this.rest.getCompetencesFromStandard(
        this.standard.stId,
      );

      // query all competences and filter to select only relevant competences for current standard
      // reduces number of api-requests, requesting data in child would lead to more requests
      this.competences$ = this.rest
        .getCompetencesWithGroupID()
        .pipe(
          map((el) => el.filter((comp) => comp.stId == this.standard.stId)),
        );
    }
  }

  // carry on compAim from children to parent
  updateForm(value: CompAim) {
    this.update.emit(value);
  }
}
