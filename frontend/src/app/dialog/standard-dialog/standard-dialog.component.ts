import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Standard } from 'src/app/modules/bilapp/interfaces/standard';

@Component({
    selector: 'app-standard-dialog',
    templateUrl: './standard-dialog.component.html',
    styleUrls: ['./standard-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class StandardDialogComponent {
  @Input() standard: Standard;

}
