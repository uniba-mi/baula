import { Component, ChangeDetectionStrategy } from '@angular/core';
import { config } from 'src/environments/config.local';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrl: './help.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HelpComponent {
  panelOpenState = false;

  navigateToDocs() {
    window.open(config.userDocsUrl, '_blank')
  }
}
