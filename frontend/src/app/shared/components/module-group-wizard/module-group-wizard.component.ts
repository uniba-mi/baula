import { Component, EventEmitter, Input, OnChanges, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { SimilarityService } from '../../services/similarity.service';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';

@Component({
  selector: 'app-module-group-wizard',
  templateUrl: './module-group-wizard.component.html',
  styleUrl: './module-group-wizard.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ModuleGroupWizardComponent implements OnChanges {
  private similarityService = inject(SimilarityService);

  @Input() mgId: string | undefined;
  @Input() structuredModuleGroups: ExtendedModuleGroup[] | null;
  @Input() possibleMgIdsBasedOnAcronym: string[] | null;
  @Output() groupSelected = new EventEmitter<string>();
  similarGroups: ExtendedModuleGroup[] = [];
  showRecommendations: boolean = false;

  // recompute on every input change, not just once on init - possibleMgIdsBasedOnAcronym
  // can arrive asynchronously after the initial render (e.g. an HTTP-backed source), so
  // ngOnInit alone would miss it and the acronym-based suggestions would never appear
  ngOnChanges(): void {
    this.similarGroups = [];
    this.showSimilarGroups();
    this.showGroupsBasedOnAcronym();
  }

  toggleRecommendations() {
    this.showRecommendations = !this.showRecommendations;
  }

  showGroupsBasedOnAcronym() {
    if (this.structuredModuleGroups && this.possibleMgIdsBasedOnAcronym) {
      for (let mgId of this.possibleMgIdsBasedOnAcronym) {
        const foundMg = this.structuredModuleGroups.find(
          (el) => el.mgId == mgId,
        );
        if (
          foundMg &&
          !this.similarGroups.find((el) => el.mgId == foundMg.mgId)
        ) {
          this.similarGroups.push(foundMg);
        }
      }
    }
  }

  showSimilarGroups() {
    if (this.structuredModuleGroups) {
      if (!this.mgId) {
        return;
      }

      const groupsWithSimilarity = this.structuredModuleGroups.map((group) => {
        const similarity = this.similarityService.calculateSimilarityScore(
          this.mgId as string,
          group.path,
        );
        return { group, similarity };
      });

      this.similarGroups = groupsWithSimilarity
        .filter((item) => item.similarity > 0.9)
        .sort((a, b) => b.similarity - a.similarity)
        .map((item) => item.group);
    }
  }

  selectSimilarGroup(mgId: string) {
    this.groupSelected.emit(mgId);
  }
}
