import { spawn } from "child_process";

export default function buildBackend(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn("npm", ["run", "buildBackend"], { cwd, stdio: "inherit", shell: true, });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error("npm run buildBackend exited with code " + code));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}