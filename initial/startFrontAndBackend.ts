import * as path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const currentFile = fileURLToPath(import.meta.url);
const currentFileDir = path.dirname(currentFile);
const rootDir = path.resolve(currentFileDir, "..");

async function startFrontend(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn("npm", ["run", "startFrontend"], { cwd, stdio: "inherit", shell: true });

        proc.on("close", (code) => {
            if (code === 0) {
                console.log("Frontend successfully started.")
                resolve();
            } else {
                reject(new Error("npm run startFrontend exited with code " + code));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

async function startBackend(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn("npm", ["run", "startBackend"], { cwd, stdio: "inherit", shell: true });

        proc.on("close", (code) => {
            if (code === 0) {
                console.log("Backend successfully started.")
                resolve();
            } else {
                reject(new Error("npm run startBackend exited with code " + code));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

export async function startFrontAndBackend() {
    const promises: Array<Promise<void>> = [startFrontend(rootDir), startBackend(rootDir)];

    let result = Promise.all(promises);
}

await startFrontAndBackend();