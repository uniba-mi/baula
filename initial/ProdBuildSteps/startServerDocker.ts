import { spawn } from "child_process";

export default async function startServerDocker(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn("npm", ["run", "startServerDocker"], { cwd, stdio: "inherit", shell: true });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error("npm run startServerDocker exited with code " + code));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}