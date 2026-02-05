import { getArguments } from "./argumentLogic.ts";

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
// import { SetupFlags as ISetupFlags } from "./setupFlags.ts";
import type { SetupFlags as ISetupFlags } from "./setupFlags.ts"; // only for TypeScript


function flagToFunctions (flag: string, val: boolean): Function{
    if (!val) return () => {};
    switch (flag) {
        case "CHECK_VERSIONS":
            return checkVersions;
        case "CREATE_CONFIG_AND_ENV":
            return createConfigAndEnvFiles;
        case "INSTALL_NPM_DEPENDENCIES":
            return installDependencies;
        case "CREATE_CERTS":
            return createCerts;
        case "CREATE_REDIS":
            return createRedis;
        case "CREATE_TEMPLATES":
            return createTemplates;
        case "CREATE_LOCAL_USERS":
            return createLocalUsers;
        case "HANDLE_DOCKER":
            return handleDocker;
        case "LOAD_MARIADB_DUMP":
            return handleDump;
        case "BUILD_PRISMA_CLIENT":
            return handlePrisma;
        default:
            break;
    }
    return () => { }
}

async function createBaula() {
    const FLAGS: ISetupFlags = getArguments();
    const functionsToExecute: Array<Function> = [];

    (Object.keys(FLAGS) as Array<keyof ISetupFlags>).forEach((flag) => {
        functionsToExecute.push(flagToFunctions(flag, FLAGS[flag]));
    });

    for (const flagFunction of functionsToExecute) {
        await flagFunction();
    }
}


// 0. Checking Node and Npm version
// TODO: Add version check for other technologies.
function checkVersions() {
    checkNode("24.10.0") ? null : console.warn("Node version is not up to date. The application may not work as expected");
    checkNpm("11.6.2") ? null : console.warn("Npm version is not up to date. The application may not work as expected");
}

// 1. Creating config end env files
async function createConfigAndEnvFiles() {
    await createRootEnv();
    await createBackendApiEnvironmentEnv();
    await createBackendApiSrcDatabaseEnv();
    await createFrontendConfigLocalTs();
    await createFrontendEnvTs();
}

// 2. Installing dependencies
async function installDependencies() {
    await installNpmDependencies();
}

// 3. Create cert files
async function createCerts() {
    await createCertFiles();
}

// 4. Redis
async function createRedis() {
    await createRedisAcl();
}

// 5. Templates
async function createTemplates() {
    await createStudentFn2apiTs();
    await createMhbFn2modTs();
}

// 6. Local users
async function createLocalUsers() {
    await createConstantsUsersTs();
}

// 7. Start docker container
// TODO: When first running this (on windows) you get asked for permission to share a folder. 
// the script crashes, before you are able to make a choice. Upon restarting the script, the ports are already in use.
async function handleDocker() {
    await handleDockerContainer();
    console.warn('If you want to start the Docker container independent from this script, you can use "npm run startLocalDocker".');
}

// 8. Load MariaDB dump
// TODO: Fix. There seems to be some problem with authentication.
async function handleDump() {
    // await handleMariaDBdump();
}

// 9. Build Prisma client
async function handlePrisma() {
    await handlePrismaClient();
}

function printFinishMessages() {
    console.log('The frontend can now be started by using "npm run startFrontend" on port 4200 from inside the root directory.');
    console.log('The frontend can now be started by using "npm run startBackend"  on port 3305 from inside the root directory.');

    console.warn('If you want to start the Docker container independent from this script, you can use "npm run startLocalDocker".');
}


createBaula();