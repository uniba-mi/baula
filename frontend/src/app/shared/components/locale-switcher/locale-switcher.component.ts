import { Component, OnInit, inject } from '@angular/core';
import {
  LocaleService,
  SupportedLocale,
} from 'src/app/shared/services/locale.service';

@Component({
  selector: 'app-locale-switcher',
  templateUrl: './locale-switcher.component.html',
  styleUrls: ['./locale-switcher.component.scss'],
  standalone: false,
})
export class LocaleSwitcherComponent implements OnInit {
  private localeService = inject(LocaleService);

  /** Only shown where the app is served under a locale prefix */
  available = false;
  current: SupportedLocale;

  ngOnInit(): void {
    this.available = this.localeService.hasLocalePrefix;
    this.current = this.localeService.current;
    // remember the locale that was served
    this.localeService.persist(this.current);
  }

  switchTo(locale: SupportedLocale): void {
    this.localeService.switchTo(locale);
  }
}
