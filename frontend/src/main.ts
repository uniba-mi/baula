import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { init, browserTracingIntegration, captureMessage } from '@sentry/angular';

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
    tracePropagationTargets: ['localhost', 'baula.minf.uni-bamberg.de/api', 'baula-test.minf.uni-bamberg.de/api'],
    tracesSampleRate: 1.0,
    environment: environment.nodeEnv,
    debug: false,
  });
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
