import { promises as fs } from "fs";
import { getRootDir } from "../helpers.ts";
import * as path from "path";
const files = {
    // .env Files
    ".env": ".env",
    ".env.backend": "/backend/api/environment/.env.backend",
    "database.env": "/backend/api/src/database/.env",

    // Config files
    "environment.prod.ts": "/frontend/src/environments/environment.prod.ts",
    "environment.ts": "/frontend/src/environments/environment.ts",
    "config.prod.ts": "/frontend/src/environments/config.prod.ts",
    "config.local.ts": "/frontend/src/environments/config.local.ts",

    // Redis
    "redis-users.acl": "/backend/api/src/database/redis-users.acl",

    // Templates
    "student-fn2api.ts": "/backend/api/src/templates/student-fn2api.ts",
    "mhb-fn2mod.ts": "/backend/api/src/templates/mhb-fn2mod.ts",

    // Users
    "users.ts": "/backend/api/src/shared/constants/users.ts",

    // Certs
    "idp_cert.pem": "/backend/api/src/certs/idp_cert.pem",
    "sp_cert.pem": "/backend/api/src/certs/sp_cert.pem",
    "sp_key.pem": "/backend/api/src/certs/sp_key.pem",
}

export default async function copyFiles() {
    const copyPath = process.env.COPY_PATH;
    const rootDir = getRootDir();
    Object.keys(files).forEach(function (key) {
        const from = path.join(copyPath as string, key);
        const to = path.join(rootDir, files[key]);
        copy(from, to);
    })
}

async function copy(from: string, to: string) {
    console.log("Copying from", from, "to", to);
    try {
        await fs.mkdir(path.dirname(to), { recursive: true });
        await fs.copyFile(from, to);
    } catch (error) {
        console.error("COULD NOT COPY", from);
        console.error(error);
    }
}