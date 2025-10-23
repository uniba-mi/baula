import { Component } from '@angular/core';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrl: './help.component.scss',
    standalone: false
})
export class HelpComponent {
  panelOpenState = false;
}
