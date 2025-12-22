/** Service to lazy load other services, currently used for download service 
 *  Inspired by https://medium.com/netanelbasal/lazy-load-services-in-angular-bcf8eae406c8
 */
import { Injectable, Injector, ProviderToken } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LazyInjectService {

  constructor(private injector: Injector) { }

  async get<T>(providerLoader: () => Promise<ProviderToken<T>>) {
    return this.injector.get(await providerLoader());
  }
}
