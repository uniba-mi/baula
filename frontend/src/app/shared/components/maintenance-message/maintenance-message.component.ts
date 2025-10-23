import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-maintenance-message',
    templateUrl: './maintenance-message.component.html',
    styleUrl: './maintenance-message.component.scss',
    standalone: false
})
export class MaintenanceMessageComponent {
  @Input() feature: string;

}
