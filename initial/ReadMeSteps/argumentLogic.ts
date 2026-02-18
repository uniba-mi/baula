import { FLAGS } from "./setupFlags.ts";

export function getArguments() {
    process.argv.forEach((arg: string) => {
        // Check for set flags, which determine what the main script should do
        
        /* Could work, may be more elegant
        try FLAGS[arg] = true 
        */
        
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
    });

    return FLAGS;
}
