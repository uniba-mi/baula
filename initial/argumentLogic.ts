import { FLAGS } from "./setupFlags.ts";

export function getArguments() {
    process.argv.forEach((arg: string) => {
        // Check for set flags, which determine what the main script should do

        /* Could work, may be more elegant
        try FLAGS[arg] = true 
        */

        /// ReadMeSteps
        switch (arg) {
            case "CHECK_VERSIONS":
                FLAGS.CHECK_VERSIONS = true;
                break;
            case "CREATE_CONFIG_AND_ENV":
                FLAGS.CREATE_CONFIG_AND_ENV = true;
                break;
            case "INSTALL_NPM_DEPENDENCIES":
                FLAGS.INSTALL_NPM_DEPENDENCIES = true;
                break;
            case "CREATE_CERTS":
                FLAGS.CREATE_CERTS = true;
                break;
            case "CREATE_REDIS":
                FLAGS.CREATE_REDIS = true;
                break;
            case "CREATE_TEMPLATES":
                FLAGS.CREATE_TEMPLATES = true;
                break;
            case "CREATE_LOCAL_USERS":
                FLAGS.CREATE_LOCAL_USERS = true;
                break;
            case "HANDLE_DOCKER":
                FLAGS.HANDLE_DOCKER = true;
                break;
            case "LOAD_MARIADB_DUMP":
                FLAGS.LOAD_MARIADB_DUMP = true;
                break;
            case "BUILD_PRISMA_CLIENT":
                FLAGS.BUILD_PRISMA_CLIENT = true;
                break;
            default:
                break;
        }


        /// ProdBuildSteps
        switch (arg) {
            case "PROD_CREATE_ENV":
                FLAGS.PROD_CREATE_ENV = true;
                break;
            case "PROD_BUILD_BACKEND":
                FLAGS.PROD_BUILD_BACKEND = true;
                break;
            case "PROD_BUILD_DOCS":
                FLAGS.PROD_BUILD_DOCS = true;
                break;
            case "PROD_BUILD_FRONTEND":
                FLAGS.PROD_BUILD_FRONTEND = true;
                break;
            case "PROD_START_DOCKER":
                FLAGS.PROD_START_DOCKER = true;
                break;
            default:
                break;
        }
    });

    return FLAGS;
}
