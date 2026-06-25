import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { SimilarityService } from '../../services/similarity.service';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';

@Component({
  selector: 'app-module-group-wizard',
  templateUrl: './module-group-wizard.component.html',
  styleUrl: './module-group-wizard.component.scss',
  standalone: false,
})
export class ModuleGroupWizardComponent {
  private similarityService = inject(SimilarityService);

  @Input() mgId: string | undefined;
  @Input() structuredModuleGroups: ExtendedModuleGroup[] | null;
  @Input() possibleMgIdsBasedOnAcronym: string[] | null;
  @Output() groupSelected = new EventEmitter<string>();
  similarGroups: ExtendedModuleGroup[] = [];
  showRecommendations: boolean = false;

  ngOnInit() {
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
