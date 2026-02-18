import { spawn } from "child_process";
import { getRootDir } from "../helpers";

const rootDir = getRootDir();

async function startDockerContainer(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn("npm", ["run", "startLocalDocker"], { cwd, stdio: "inherit", shell: true });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error("npm run startLocalDocker exited with code " + code));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

export async function handleDockerContainer() {
    try {
        await startDockerContainer(rootDir);
        console.log("Docker container successfully started.")
    } catch (error) {
        console.error("Docker container could not be started. Aborting.");
        throw error;
    }
}

async function loadMariaDBdump(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn(
            "docker", // 1...
            [
                "exec",
                "-i",
                "baula-mariadb-1",
                "sh",
                "-c",
                "cd /backups " + // 2...
                '&& mariadb -u root -p"$MYSQL_ROOT_PASSWORD" -D"$MYSQL_DATABASE" < initial_backup.sql' // 3...
            ],
            { stdio: "inherit" }
        );

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(
                    `docker exec -it baula-mariadb-1 bash \n \\
                     cd /backups \n \\
                     mariadb -u root -p"$MYSQL_ROOT_PASSWORD" -D"$MYSQL_DATABASE" < initial_backup.sql \n
                     exited with code ` + code));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

export async function handleMariaDBdump() {
    try {
        await loadMariaDBdump(rootDir);
        console.log("MariaDB dump successfully loaded.")
    } catch (error) {
        console.error("MariaDB dump could not be loaded. Aborting");
        throw error;
    }
}