import { getRootDir } from "../helpers.ts";
import * as path from "path";
import { promises as fs } from "fs";

/*
const paths = [
    "package.json",
    // Compose files
    "docker-compose.override.yml",
    "docker-compose.server.yml",
    "docker-compose.yml",
    // docker-compose.override.yml
    // TODO: "documentation/user-docs",
    // TODO: "documentation/developer-docs",
    // docker-compose.server.yml
    /// server
    "server/app",

    // TODO: "documentation/user-docs/.retype",
    // TODO: "documentation/developer-docs/.retype",
    "documentation",
    
    "server/apache2/sites-available",
    /// rest_api
    "backend/api/dist/backend/api",
    "backend/api/dist/interfaces",
    // docker-compose.yml
    /// mongodb
    "data/mongodb",
    "data/backups/mongodb",
    /// mariadb
    "data/backups/mariadb",
    "data/mariadb",
    /// redis
    "data/redis",
    "backend/api/src/database/redis-users.acl",
]
*/
const paths = [
    "package.json",
    // Compose files
    "docker-compose.override.yml",
    "docker-compose.server.yml",
    "docker-compose.yml",
    "server",
    "documentation",
    "data",
    "backend/api"
]
const rootDir = getRootDir();

const deployDir = "/home/gitlab-runner/deployment";

export default async function deploy() {
    // Copy every file from rootDir + files[x] to deployDIr + files[x]
    // Make sure subfolders are correct
    // Make sure we do not need more retype/ docs dirs/files

    for (let elPath of paths) {
        await copyFileOrDir(path.join(rootDir, elPath), path.join(deployDir, elPath));
    }
}

async function copyFileOrDir(from: string, to: string) {
    await fs.mkdir(path.dirname(to), { recursive: true });
    const stat = await fs.stat(from);
    const isDir = stat.isDirectory();

    try {

        if (isDir) {
            await fs.cp(from, to, { recursive: true });
        } else {
            await fs.copyFile(from, to);
        }
    } catch (error) {
        console.error("COULD NOT COPY", from);
        console.error(error);
    }
}