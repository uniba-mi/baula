import * as path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";


const currentFile = fileURLToPath(import.meta.url);
const currentFileDir = path.dirname(currentFile);
const rootDir = path.resolve(currentFileDir, "..");

const npmInstallPaths = [rootDir + "/backend/api", rootDir + "/frontend"];

export async function installNpmDependencies() {
    for (const path of npmInstallPaths) {
        try {
            console.log("Trying to install npm dependencies for " + path)
            await executeNpmInstall(path);
            console.log("Npm dependencies in " + path + " installed .")
        } catch (error) {
            console.error("Npm dependencies in " + path + " could not be installed.")
            console.error(error);
        }
    }
}

function executeNpmInstall(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn("npm", ["install"], { cwd, stdio: "inherit", shell: true });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error("npm install exited with code " + code));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}