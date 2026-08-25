import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-select-option-dialog',
    templateUrl: './select-option-dialog.component.html',
    styleUrls: ['./select-option-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SelectOptionDialog {
  @Input() options: { value: string, label: string }[];
  @Input() dialogTitle: string;
  option: string;

  selectOption() {
    return this.option;
  }
}
