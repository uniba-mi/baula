import { Component, Input, OnChanges, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Module } from '@interfaces/module';
import { ModuleGroup } from '@interfaces/module-group';
import { StudyPath } from '@interfaces/study-path';
import { PieCardData } from 'src/app/modules/reporting/reporting';

@Component({
    selector: 'app-module-group-progress-chart',
    templateUrl: './module-group-progress-chart.component.html',
    styleUrls: ['./module-group-progress-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ModuleGroupProgressChartComponent implements OnInit, OnChanges {
  @Input() studyPath: StudyPath;
  @Input() mgs: ModuleGroup[] | undefined | null;

  public cardData: PieCardData | undefined;

  constructor() { }

  ngOnInit(): void {
    if(this.mgs) {
      this.setDatasets(this.mgs);
    }
  }

  ngOnChanges(): void {
    if(this.mgs) {
      this.setDatasets(this.mgs);
    }
  }

  private setDatasets(mgs: ModuleGroup[]) {
    this.cardData = {
      title: 'Belegungen in Modulgruppen',
      categories: ['Bestanden', 'Nicht bestanden', 'Belegt', 'Nicht belegt'],
      colors: ['rgba(172, 204, 61, 0.8)', 'rgba(235, 105, 114, 0.8)', 'rgba(102, 144, 177, 0.8)', 'rgb(159, 159, 156, 0.8)'],
      rings: mgs.map((mg) => ({
        name: mg.name.toString(),
        data: this.calculateModuleCountsForModuleGroup(mg, this.studyPath),
      })),
    } satisfies PieCardData;
  }

  private calculateModuleCountsForModuleGroup(mg: ModuleGroup, path: StudyPath): number[] {
    let modules: Module[] = [];
    // get modules of modulegroup
    if(mg.modules) {
      modules = modules.concat(mg.modules)
    }
    if(mg.children) {
      modules = modules.concat(this.findModulesOfModuleGroups(mg.children))
    }

    // check if modules are in path -> use acronym for checkup
    const acronyms = modules.map(el => el.acronym);
    let passed = 0;
    let failed = 0;
    let taken = 0;
      for(let m of path.completedModules) {
        if(acronyms.includes(m.acronym)) {
          switch (m.status) {
            case 'taken':
              taken++;
              break;
            case 'failed':
              failed++;
              break;
            case 'passed':
              passed++;
              break;
            default:
              break;
          }
        }
    }
    return [passed, failed, taken, (acronyms.length-passed-failed-taken)];
  }

  private findModulesOfModuleGroups(mgs: ModuleGroup[]): Module[] {
    let modules: Module[] = [];
    for(let mg of mgs) {
      if(mg.children) {
        modules = modules.concat(this.findModulesOfModuleGroups(mg.children))
      } 
      if(mg.modules) {
        modules = modules.concat(mg.modules)
      }
    }
    return modules;
  }

}
