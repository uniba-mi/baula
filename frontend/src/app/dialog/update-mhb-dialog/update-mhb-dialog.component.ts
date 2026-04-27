import { Component, Input, OnInit } from '@angular/core';
import { ModuleHandbook } from '../../../../../interfaces/module-handbook';
import { ModService } from 'src/app/shared/services/module.service';
import { RestService } from 'src/app/rest.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-update-mhb-dialog',
  standalone: false,
  templateUrl: './update-mhb-dialog.component.html',
  styleUrl: './update-mhb-dialog.component.scss',
})
export class UpdateMhbDialogComponent implements OnInit {
  @Input() currentMhb: ModuleHandbook;
  changeLog: string;
  upToDateMhb: ModuleHandbook;

  constructor(private modService: ModService, private rest: RestService) {}

  ngOnInit(): void {
    this.rest.getUpToDateModulehandbook(this.currentMhb.mhbId).pipe(take(1)).subscribe(mhb => {
      this.upToDateMhb = mhb;
      this.changeLog = this.modService.compareMhbs(this.currentMhb, mhb)
    })
  }

}
