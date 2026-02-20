import { getRootDir, createFile } from "../helpers.ts";

export async function createFrontendProdEnvTs() {
    const rootDir = getRootDir();
    const filePath = rootDir + "/frontend/src/environments/environment.prod.ts";
    const fileNameInMessage = "environment.prod.ts file in /frontend/src/environments";
    const content =
        `import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const environment = {
    production: false, // true for production
    imports: [
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: true, connectInZone: true }) // only needed for visible redux (recommended for test only)
    ],
    sentryDsn: 'https://my-sentry-link.test', // add sentry url
    sentryTracePropagationTargets: ['localhost'], // add additional urls like /api
    nodeEnv: 'development', // set 'production' for public release
    plausibleSrc: 'https://your-plausible-domain', // your specific plausible url
    googleSiteVerificationCode: 'your-verification-code-for-search-console' // for usage of google search console add verification code here
};
    `;

    await createFile(filePath, fileNameInMessage, content);
    console.warn("Warning: The file " + filePath + " has only been filled with example content.");
}

/// Frontend env and config files
export async function createFrontendConfigLocalTs() {
    const rootDir = getRootDir();
    const filePath = rootDir + "/frontend/src/environments/config.prod.ts";
    const fileNameInMessage = "config.prod.ts file in /frontend/src/environments";
    const content =
        `import { Config } from "./config.interface";

export const config: Config = {
    homeUrl: 'http://localhost:4200', 
    apiUrl: 'http://localhost:3305/api/',
    loginUrl: 'http://localhost:3305/login/',
    shibLoginUrl: 'https://meine-domain.test/Shibboleth.sso/Login',
    localLogoutUrl: 'http://localhost:3305/logout', 
    shibLogoutUrl: 'https://meine-domain.test/Shibboleth.sso/Logout', 
    dashboardUrl: 'app/',
    demoUser: 'demo', 
    demoPassword: 'demo'
}
    `;

    await createFile(filePath, fileNameInMessage, content);
    console.warn("Warning: The file " + filePath + " has only been filled with example content.");
}