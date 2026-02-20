import { getRootDir } from "../helpers.ts";
import buildBackend from "./buildBackend.ts";
import buildDocs from "./buildDocs.ts";
import buildFrontendProd from "./buildFrontendProd.ts";
import { createFrontendProdEnvTs, createFrontendConfigLocalTs } from "./createProdEnv.ts";
import startServerDocker from "./startServerDocker.ts";

export default class ProdBuildSteps {
    flagToFunctions(flag: string, val: boolean): Function {
        if (!val) return () => { };
        switch (flag) {
            case "PROD_CREATE_ENV":
                return this.createProdEnv;
            case "PROD_BUILD_BACKEND":
                return this.buildBackend;
            case "PROD_BUILD_DOCS":
                return this.buildDocs;
            case "PROD_BUILD_FRONTEND":
                return this.buildFrontend;
            case "PROD_START_DOCKER":
                return this.startServerDocker;
            default:
                break;
        }
        return () => { }
    }

    async createProdEnv() {
        await createFrontendProdEnvTs();

        await createFrontendConfigLocalTs();
        console.log("Required frontend config/ environment files have been created. They are only filled with example content.")
    }

    async buildBackend() {
        const rootDir = getRootDir();
        try {
            await buildBackend(rootDir);
            console.log("Backend has been built.")
        } catch (error) {
            console.error("There was an error building the backend. Aborting.")
            throw error;
        }
    }

    async buildDocs() {
        const rootDir = getRootDir();
        try {
            await buildDocs(rootDir);
            console.log("Docs have been built.")
        } catch (error) {
            console.error("There was an error building the docs. Aborting.")
            throw error;
        }
    }

    async buildFrontend() {

        const rootDir = getRootDir();
        try {
            await buildFrontendProd(rootDir);
            console.log("Frontend has been built.")
        } catch (error) {
            console.error("There was an error building the frontend. Aborting.")
            throw error;
        }
    }

    async startServerDocker() {
        const rootDir = getRootDir();

        try {
            await startServerDocker(rootDir);
            console.log("Server Docker successfully started.")
        } catch (error) {
            console.error("There was an error starting the server Docker. Aborting.")
            throw error;
        }
    }
}