import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'admin-delete-dialog',
    templateUrl: './delete-dialog.component.html',
    styleUrl: './delete-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DeleteDialogComponent {
  @Input() dialogContentId: String;
}
