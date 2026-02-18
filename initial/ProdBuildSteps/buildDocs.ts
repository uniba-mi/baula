import { spawn } from "child_process";

import { fileURLToPath } from "url";

function buildDocs(cwd: string): Promise<void> {
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