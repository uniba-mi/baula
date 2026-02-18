import * as path from "path";
import { spawn } from "child_process";
import { getRootDir } from "../helpers";

const rootDir = getRootDir();
const prismaDir = path.resolve(rootDir, "backend", "api");

async function buildPrismaClient(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn("npm", ["run", "updateDB"], { cwd, stdio: "inherit", shell: true });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error("npm run updateDB exited with code " + code));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

export async function handlePrismaClient() {
    try {
        await buildPrismaClient(prismaDir);
        console.log("Prisma client successfully generated.")
    } catch (error) {
        console.error("npm run updateDB could not be started. Aborting.");
        throw error;
    }
}