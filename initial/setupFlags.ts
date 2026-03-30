export interface SetupFlags {
    CHECK_VERSIONS: boolean;
    CREATE_CONFIG_AND_ENV: boolean;
    INSTALL_NPM_DEPENDENCIES: boolean;
    CREATE_CERTS: boolean;
    CREATE_REDIS: boolean;
    CREATE_TEMPLATES: boolean;
    CREATE_LOCAL_USERS: boolean;
    HANDLE_DOCKER: boolean;
    LOAD_MARIADB_DUMP: boolean;
    BUILD_PRISMA_CLIENT: boolean;

    // PROD FLAGS
    PROD_CREATE_ENV: boolean;
    PROD_BUILD_BACKEND: boolean;
    PROD_BUILD_DOCS: boolean;
    PROD_BUILD_FRONTEND: boolean;
    PROD_START_DOCKER: boolean;
    PROD_COPY_FILES: boolean;

    // HEALTH CHECK FLAGS
    CHECK_API_PYTHON: boolean;
    CHECK_API_NODE: boolean;
    CHECK_APACHE: boolean;
    CHECK_MONGO: boolean;
    CHECK_REDIS: boolean;
    CHECK_MARIADB: boolean;
    CHECK_ALL: boolean;
}


export const FLAGS: SetupFlags = {
    CHECK_VERSIONS: false,
    CREATE_CONFIG_AND_ENV: false,
    INSTALL_NPM_DEPENDENCIES: false,
    CREATE_CERTS: false,
    CREATE_REDIS: false,
    CREATE_TEMPLATES: false,
    CREATE_LOCAL_USERS: false,
    HANDLE_DOCKER: false,
    LOAD_MARIADB_DUMP: false,
    BUILD_PRISMA_CLIENT: false,

    PROD_CREATE_ENV: false,
    PROD_BUILD_BACKEND: false,
    PROD_BUILD_DOCS: false,
    PROD_BUILD_FRONTEND: false,
    PROD_START_DOCKER: false,
    PROD_COPY_FILES: false,

    CHECK_API_PYTHON: false,
    CHECK_API_NODE: false,
    CHECK_APACHE: false,
    CHECK_MONGO: false,
    CHECK_REDIS: false,
    CHECK_MARIADB: false,
    CHECK_ALL: false,
};