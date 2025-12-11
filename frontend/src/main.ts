import { enableProdMode } from '@angular/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { init, browserTracingIntegration } from '@sentry/angular';
import { platformBrowser } from '@angular/platform-browser';

// check browser do not track
function isDoNotTrackEnabled(): boolean {
  return navigator.doNotTrack === '1'
}

const userDoNotTrack = JSON.parse(localStorage.getItem('doNotTrack') || 'null');
const doNotTrack = userDoNotTrack !== null ? userDoNotTrack : isDoNotTrackEnabled();

// only allow monitoring if do not track is disabled
if (!doNotTrack) {
  init({
    dsn: environment.sentryDsn,
    integrations: [browserTracingIntegration()],
    tracePropagationTargets: environment.sentryTracePropagationTargets ?? [],
    tracesSampleRate: 1.0,
    environment: environment.nodeEnv,
    debug: false,
  });
}

if (environment.production) {
  enableProdMode();
}

// add plausible
if(environment.plausibleSrc) {
  const domain = window.location.host
  const script = document.createElement('script')
  script.async = true
  script.defer = true
  script.dataset.domain = domain
  script.src = environment.plausibleSrc
  document.head.append(script)
}

// add google site verification code for search console
if (environment.googleSiteVerificationCode) {
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'google-site-verification')
  meta.setAttribute('content', environment.googleSiteVerificationCode)
  document.head.append(meta)
}

platformBrowser().bootstrapModule(AppModule)
  .catch(err => console.error(err));
