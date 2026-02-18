
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



class ReadMeSteps {
    flagToFunctions(flag: string, val: boolean): Function {
        if (!val) return () => { };
        switch (flag) {
            case "CHECK_VERSIONS":
                return this.checkVersions;
            case "CREATE_CONFIG_AND_ENV":
                return this.createConfigAndEnvFiles;
            case "INSTALL_NPM_DEPENDENCIES":
                return this.installDependencies;
            case "CREATE_CERTS":
                return this.createCerts;
            case "CREATE_REDIS":
                return this.createRedis;
            case "CREATE_TEMPLATES":
                return this.createTemplates;
            case "CREATE_LOCAL_USERS":
                return this.createLocalUsers;
            case "HANDLE_DOCKER":
                return this.handleDocker;
            case "LOAD_MARIADB_DUMP":
                return this.handleDump;
            case "BUILD_PRISMA_CLIENT":
                return this.handlePrisma;
            default:
                break;
        }
        return () => { }
    }

    // 0. Checking Node and Npm version
    // TODO: Add version check for other technologies.
    checkVersions() {
        checkNode("24.10.0") ? null : console.warn("Node version is not up to date. The application may not work as expected");
        checkNpm("11.6.2") ? null : console.warn("Npm version is not up to date. The application may not work as expected");
    }

    // 1. Creating config end env files
    async createConfigAndEnvFiles() {
        await createRootEnv();
        await createBackendApiEnvironmentEnv();
        await createBackendApiSrcDatabaseEnv();
        await createFrontendConfigLocalTs();
        await createFrontendEnvTs();
    }

    // 2. Installing dependencies
    async installDependencies() {
        await installNpmDependencies();
    }



    // 3. Create cert files
    async createCerts() {
        await createCertFiles();
    }

    // 4. Redis
    async createRedis() {
        await createRedisAcl();
    }

    // 5. Templates
    async createTemplates() {
        await createStudentFn2apiTs();
        await createMhbFn2modTs();
    }

    // 6. Local users
    async createLocalUsers() {
        await createConstantsUsersTs();
    }

    // 7. Start docker container
    // TODO: When first running this (on windows) you get asked for permission to share a folder. 
    // the script crashes, before you are able to make a choice. Upon restarting the script, the ports are already in use.
    async handleDocker() {
        await handleDockerContainer();
        console.warn('If you want to start the Docker container independent from this script, you can use "npm run startLocalDocker".');
    }

    // 8. Load MariaDB dump
    // TODO: Fix. There seems to be some problem with authentication.
    async handleDump() {
        // await handleMariaDBdump();
    }

    // 9. Build Prisma client
    async handlePrisma() {
        await handlePrismaClient();
    }

}

export default ReadMeSteps;