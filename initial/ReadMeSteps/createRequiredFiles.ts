import { createFile, getRootDir } from "../helpers.ts";

const rootDir = getRootDir();

/// Backend env files

export async function createRootEnv() {
    const filePath = rootDir + "/.env";
    const fileNameInMessage = ".env file in the root directory";
    const content =
        `# .env
# required information 
MONGO_USERNAME=root # user for mongodb
MONGO_PASSWORD=password # passowrd for mongodb
RELDB_ROOT_PW=password # root password for mariadb
RELDB_USER=user # additional user for accessing the mariadb
RELDB_PASSWORD=password # password for additional user
RELDB_DATABASE=dbname # database name in mariadb

# only for deployment on server
SERVER_PORT_SSL=443 # ssl port on the server
SERVER_PORT=80 # regular port on the server
HOSTNAME=localhost # replace localhost by hostname (e.g. domain)
HOST_URL=https://localhost # replace localhost by domain
HOST_IP=123.456.789.101

API_PORT=1234 # port where backend is served
DOCS_PORT=4201

# only for gitlab-runner/ CI deployment
RUNNER_UID=999
RUNNER_GID=987
    `;

    await createFile(filePath, fileNameInMessage, content);
}

export async function createBackendApiEnvironmentEnv() {
    const filePath = rootDir + "/backend/api/environment/.env.backend";
    const fileNameInMessage = ".env.backend file in /backend/api/environment/";
    const content =
        `# .env.backend 
NODE_ENV=local
ORIGIN=http://localhost:4200
SESSION_SECRET=firstsecret
SAML_ENTRY_POINT=https://idp.test.de/idp/profile/SAML2/Redirect/SSO # entry point of your idp
SAML_ISSUER=https://sp.test.de/shibboleth # entity id of your sp
SAML_CALLBACK_URL=https://sp.test.de/Shibboleth.sso/SAML2/POST # callback url of your sp
MONGO_DATABASE_URL=mongodb://root:password@localhost:27017/Baula?authSource=admin&retryWrites=true&w=majority
REDIS_URL=redis://test:test123@localhost:6379
PYTHON_URL=http://localhost
SESSION_ENC_KEY=OYgZjzXvk1dVmLSGE41ziK5jNhyoXxTFC2SEa3+hWTo= #key size must be 32 bytes in base64
LOGIN_PAGE_URL=http://localhost:4200/login
DASHBOARD_URL=https://test.de/app/
COOKIE_SECURE=false
SESSION_NAME=yourSessionName
TEST_USER=user
ADMIN_USER=admin
DEMO_USER=demo
TEST_PW=secretPassword
ADMIN_PW=safePassword
DEMO_PW=demo

#Additional variables required for server environment
FN_LOGIN=user
FN_PW=superSecret123
FN_MHBS_URL=https://your-fn2-url.de/api/mhbs
FN_STUDENT_URL=https://your-fn2-url.de/api/student
FN_EXAM_URL_BASE=https://your-fn2-url.de/api/enroll
    `;

    await createFile(filePath, fileNameInMessage, content);
}

export async function createBackendApiSrcDatabaseEnv() {
    const filePath = rootDir + "/backend/api/src/database/.env";
    const fileNameInMessage = ".env file in /backend/api/src/database";
    const content =
        `# .env
REL_DATABASE_URL=mysql://user:password@localhost:3306/dbname
    `;

    await createFile(filePath, fileNameInMessage, content);
}

/// Frontend env and config files
export async function createFrontendConfigLocalTs() {
    const filePath = rootDir + "/frontend/src/environments/config.local.ts";
    const fileNameInMessage = "config.local.ts file in /frontend/src/environments";
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
    userDocsUrl: 'http://localhost:4201',
    demoUser: 'demo', 
    demoPassword: 'demo'
}
    `;

    await createFile(filePath, fileNameInMessage, content);
    console.warn("Warning: The file " + filePath + " has only been filled with example content.");
    console.warn("Warning: Only the frontend config for the local configuration has been created.");
}

export async function createFrontendEnvTs() {
    const filePath = rootDir + "/frontend/src/environments/environment.ts";
    const fileNameInMessage = "environment.ts file in /frontend/src/environments";
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

/// Redis file
export async function createRedisAcl() {
    const filePath = rootDir + "/backend/api/src/database/redis-users.acl";
    const fileNameInMessage = "redis-users.acl file in /backend/api/src/database";
    const content =
        `user default off
user test on >test123 ~* +@all
`;

    await createFile(filePath, fileNameInMessage, content);
}

/// Template files
export async function createStudentFn2apiTs() {
    const filePath = rootDir + "/backend/api/src/templates/student-fn2api.ts";
    const fileNameInMessage = "student-fn2api.ts file in /backend/api/src/templates";
    const content =
        `// student-fn2api.ts
export const studyPathTemplate = [];
export const metaDataTemplate = [];`;

    await createFile(filePath, fileNameInMessage, content);
}

export async function createMhbFn2modTs() {
    const filePath = rootDir + "/backend/api/src/templates/mhb-fn2mod.ts";
    const fileNameInMessage = "mhb-fn2mod.ts file in /backend/api/src/templates";
    const content =
        `// mhb-fn2mod.ts
export const depTemplate = [];
export const personTemplate = [];
export const spTemplate = [];
export const mhbTemplate = [];
export const mgTemplate = [];
export const mcTemplate = [];
export const modTemplate = [];
export const modDepTemplate = [];
export const moduleExamTemplate = [];
export const sp2mhbTemplate = [];
export const per2mcTemplate = [];
export const mhb2mgTemplate = [];
export const mg2mgTemplate = [];
export const mg2modTemplate = [];
export const m2mcTemplate = [];`;

    await createFile(filePath, fileNameInMessage, content);
}

/// Local users
export async function createConstantsUsersTs() {
    const filePath = rootDir + "/backend/api/src/shared/constants/users.ts";
    const fileNameInMessage = "users.ts file in /backend/api/src/shared/constants";
    // TODO: Reference users in .env.backend
    const content =
        `export const USERS = [
    {
        shibId: "10101010101010101010101010101010", // muss exakt 32 Zeichen lang sein
        username: process.env.USER,
        password: process.env.USER_PW,
        roles: ["student"],
    },
    {
        shibId: "10101010101010001010101010101011",
        username: process.env.DEMO_USER,
        password: process.env.DEMO_PW,
        roles: ["student", "demo"],
    },
    {
        shibId: "11010101010101010101010101010101",
        username: process.env.ADMIN_USER,
        password: process.env.ADMIN_PW,
        roles: ["student", "admin"],
    }
]`;

    await createFile(filePath, fileNameInMessage, content);
}