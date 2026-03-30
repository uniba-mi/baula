import { Component } from '@angular/core';
import { config } from 'src/environments/config.local';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrl: './help.component.scss',
    standalone: false
})
export class HelpComponent {
  panelOpenState = false;

  navigateToDocs() {
    console.log(config.userDocsUrl)
    window.open(config.userDocsUrl, '_blank')
  }
}
