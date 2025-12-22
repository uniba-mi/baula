import { Injectable } from '@angular/core';

declare global {
  interface Window {
    plausible?: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  
  trackEvent(eventName: string, props?: Record<string, any>) {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible(eventName, { props });
    }
  }

  trackPageview(url?: string) {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('pageview', url ? { u: url } : {});
    }
  }
}