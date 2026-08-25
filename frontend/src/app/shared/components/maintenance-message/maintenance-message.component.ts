import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-maintenance-message',
    templateUrl: './maintenance-message.component.html',
    styleUrl: './maintenance-message.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MaintenanceMessageComponent {
  @Input() feature: string;

}
