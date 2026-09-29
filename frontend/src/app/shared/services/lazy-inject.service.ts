/** Service to lazy load other services, currently used for download service
 *  Inspired by https://medium.com/netanelbasal/lazy-load-services-in-angular-bcf8eae406c8
 */
import { Injectable, Injector, ProviderToken, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LazyInjectService {
  private injector = inject(Injector);

  async get<T>(providerLoader: () => Promise<ProviderToken<T>>) {
    return this.injector.get(await providerLoader());
  }
}
