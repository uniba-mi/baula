import { Component, Input } from '@angular/core';
import { Standard } from 'src/app/modules/bilapp/interfaces/standard';

@Component({
    selector: 'app-standard-dialog',
    templateUrl: './standard-dialog.component.html',
    styleUrls: ['./standard-dialog.component.scss'],
    standalone: false
})
export class StandardDialogComponent {
  @Input() standard: Standard;

}
