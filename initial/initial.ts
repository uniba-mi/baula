import { checkNode, checkNpm } from "./checkVersions.ts";

import {
    createRootEnv, createBackendApiEnvironmentEnv, createBackendApiSrcDatabaseEnv,
    createFrontendConfigLocalTs, createFrontendEnvTs,
    createRedisAcl,
    createStudentFn2apiTs, createMhbFn2modTs,
    createConstantsUsersTs
} from "./createRequiredFiles.ts";

import { installNpmDependencies } from "./installDependencies.ts";

import { createCertFiles } from "./createCerts.ts";

import {
    handleDockerContainer,
    handleMariaDBdump
} from "./dockerOperations.ts";

import { handlePrismaClient } from "./buildPrismaClient.ts";

// 0. Checking Node and Npm version
checkNode("24.10.0") ? null : console.warn("Node version is not up to date. The application may not work as expected");
checkNpm("11.6.2") ? null : console.warn("Npm version is not up to date. The application may not work as expected");

// 1. Creating config end env files
await createRootEnv();
await createBackendApiEnvironmentEnv();
await createBackendApiSrcDatabaseEnv();
await createFrontendConfigLocalTs();
await createFrontendEnvTs();

// 2. Installing dependencies
await installNpmDependencies();

// 3. Create cert files
await createCertFiles();

// 4. Redis
await createRedisAcl();

// 5. Templates
await createStudentFn2apiTs();
await createMhbFn2modTs();

// 6. Local users
await createConstantsUsersTs();

// 7. Start docker container
// TODO: When first running this (on windows) you get asked for permission to share a folder. 
// the script crashes, before you are able to make a choice. Upon restarting the script, the ports are already in use.
await handleDockerContainer();
console.warn('If you want to start the Docker container independent from this script, you can use "npm run startLocalDocker".');

// 8. Load MariaDB dump
// await handleMariaDBdump();

// 9. Build Prisma client
await handlePrismaClient();

console.log('The frontend can now be started by using "npm run startFrontend" on port 4200 from inside the root directory.');
console.log('The frontend can now be started by using "npm run startBackend"  on port 3305 from inside the root directory.');

console.warn('If you want to start the Docker container independent from this script, you can use "npm run startLocalDocker".');
