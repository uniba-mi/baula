import { Component, Input } from '@angular/core';

@Component({
    selector: 'admin-delete-dialog',
    templateUrl: './delete-dialog.component.html',
    styleUrl: './delete-dialog.component.scss',
    standalone: false
})
export class DeleteDialogComponent {
  @Input() dialogContentId: String;
}
