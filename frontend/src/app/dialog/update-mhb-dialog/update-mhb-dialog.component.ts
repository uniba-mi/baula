import { Component, Input, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { ModuleHandbook } from '@interfaces/module-handbook';
import { ModService } from 'src/app/shared/services/module.service';
import { RestService } from 'src/app/rest.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-update-mhb-dialog',
  standalone: false,
  templateUrl: './update-mhb-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './update-mhb-dialog.component.scss',
})
export class UpdateMhbDialogComponent implements OnInit {
  private modService = inject(ModService);
  private rest = inject(RestService);

  @Input() currentMhb: ModuleHandbook;
  changeLog: string;
  upToDateMhb: ModuleHandbook;

  ngOnInit(): void {
    this.rest
      .getUpToDateModulehandbook(this.currentMhb.mhbId)
      .pipe(take(1))
      .subscribe((mhb) => {
        this.upToDateMhb = mhb;
        this.changeLog = this.modService.compareMhbs(this.currentMhb, mhb);
      });
  }
}
