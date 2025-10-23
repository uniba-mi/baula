import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-no-data',
    templateUrl: './no-data.component.html',
    styleUrls: ['./no-data.component.scss'],
    standalone: false
})
export class NoDataComponent {
  @Input() noDataMessage?: string;
  @Input() noDataBtnText?: string;
  @Input() noDataLinkText?: string;
  @Input() diagram: boolean; // true for displayal in diagram, else false
}
