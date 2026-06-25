import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SimilarityService } from '../../services/similarity.service';
import { ModService } from '../../services/module.service';
import { Observable, take } from 'rxjs';

@Component({
  selector: 'app-change-module-group',
  standalone: false,
  templateUrl: './change-module-group.component.html',
  styleUrl: './change-module-group.component.scss',
})
export class ChangeModuleGroupComponent implements OnInit {
  private modService = inject(ModService);

  @Input() mgId: string | undefined;
  @Input() structuredModuleGroups: ExtendedModuleGroup[] | null;
  @Input() acronym: string | undefined;
  @Output() selectModuleGroup = new EventEmitter<string>();

  selectedModuleGroup = new FormControl('', Validators.required);
  similarGroups: ExtendedModuleGroup[];
  possibleMgIdsBasedOnAcronym$: Observable<string[]>;

  ngOnInit(): void {
    if (this.acronym) {
      this.possibleMgIdsBasedOnAcronym$ = this.modService.findModuleGroups(
        this.acronym,
      );
    }
    if (this.mgId) {
      this.selectedModuleGroup.setValue(this.mgId);
    }
  }

  select(mgId: string) {
    this.selectModuleGroup.emit(mgId);
  }

  selectSimilarGroup(mgId: string): void {
    this.selectedModuleGroup.setValue(mgId);
    this.select(mgId);
  }
}
