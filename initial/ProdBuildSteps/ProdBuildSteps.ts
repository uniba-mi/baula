import { getRootDir } from "../helpers.ts";
import buildBackend from "./buildBackend.ts";
import buildDocs from "./buildDocs.ts";
import buildFrontendProd from "./buildFrontendProd.ts";

export default class ProdBuildSteps {
    flagToFunctions(flag: string, val: boolean): Function {
        if (!val) return () => { };
        switch (flag) {
            case "PROD_BUILD_BACKEND":
                return this.buildBackend;
            case "PROD_BUILD_DOCS":
                return this.buildDocs;
            case "PROD_BUILD_FRONTEND":
                return this.buildFrontend;
            default:
                break;
        }
        return () => { }
    }

    async buildBackend() {
        await buildBackend();
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
        await buildFrontendProd();
    }
}