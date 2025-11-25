import { Component, inject, input } from '@angular/core';
import { MetaCardData } from '../reporting';
import { LazyInjectService } from 'src/app/shared/services/lazy-inject.service';
import { DownloadService } from '../../../shared/services/download.service';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'reporting-meta-data-card',
  imports: [
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './meta-data-card.component.html',
  styleUrl: './meta-data-card.component.scss',
})
export class MetaDataCardComponent {
  cardData = input.required<MetaCardData>()
  lazyInject = inject(LazyInjectService)

  exportReport(): void {
    const report = this.cardData()?.reportData
    if(report) {
      const date = new Date();
      const formattedDate = `${date.getDate()}_${
        date.getMonth() + 1
      }_${date.getFullYear()}`;
      this.lazyInject
        .get<DownloadService>(() =>
          import('../../../shared/services/download.service').then(
            (m) => m.DownloadService
          )
        )
        .then((download) =>
          download.downloadJSONFile(report, `report_${formattedDate}.json`)
        );
      }
  }
}
