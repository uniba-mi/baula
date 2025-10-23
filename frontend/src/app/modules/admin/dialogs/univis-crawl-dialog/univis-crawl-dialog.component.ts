import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'admin-univis-crawl-dialog',
    templateUrl: './univis-crawl-dialog.component.html',
    styleUrls: ['./univis-crawl-dialog.component.scss'],
    standalone: false
})
export class UnivisCrawlDialogComponent {
  @Input() univisCrawl$: Observable<string[]>

  constructor() { }

}
