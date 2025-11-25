import { Config } from "./config.interface";

export const config: Config = {
    homeUrl: 'http://localhost:4200', 
    apiUrl: 'http://localhost:3305/api/',
    loginUrl: 'http://localhost:3305/login/',
    shibLoginUrl: 'https://baula-test.minf.uni-bamberg.de/Shibboleth.sso/Login',
    localLogoutUrl: 'http://localhost:3305/logout', 
    shibLogoutUrl: 'https://baula-test.minf.uni-bamberg.de/Shibboleth.sso/Logout', 
    dashboardUrl: 'app/',
}
