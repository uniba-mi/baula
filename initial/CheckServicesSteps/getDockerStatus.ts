import { getRootDir } from "../helpers.ts";
import { spawn } from "child_process";

export default async function getDockerStatus(command: string): Promise<string> {
    const cwd = getRootDir();

    return new Promise((resolve, reject) => {
        const proc = spawn(command, {
            cwd,
            shell: true,
        });

        let output = "";
        let errorOutput = "";

        proc.stdout.on("data", (data) => {
            output += data.toString();
        });

        proc.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(errorOutput || `Exited with code ${code}`));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

function parseDockerPSLine(line: string) {
    const parts = [];
    const part = line.split(/ {2,}/);
    parts.push(part);

    const container = {
        containerId: part[0],
        image: part[1],
        command: part[2],
        created: part[3],
        status: part[4],
        ports: part[5],
        names: part[6],
    }
    return container;
}

// Returns running docker machines as JSON array. Each entry has the following format:
// {
//     containerId: string,
//     image: string,
//     command: string,
//     created: string,
//     status: string,
//     ports: string,
//     names: string,
// }
export function convertDockerPS(dockerOutput: string): JSON[] {
    const split = dockerOutput.split("\n");
    split.shift();
    // remove empty entry if it is empty
    if (split[split.length - 1] === "") {
        split.pop();
    }
    
    const containers = [];
    for (let dockerContainer of split) {
        containers.push(parseDockerPSLine(dockerContainer));
    }
    return containers;
};

export async function executeCommandInDocker(command: string, containerId: string): Promise<string> {
    const cwd = getRootDir();

    return new Promise((resolve, reject) => {
        const fullCommand = `docker exec ${containerId} ${command}`;
        const proc = spawn(fullCommand, {
            cwd,
            shell: true,
        });

        let output = "";
        let errorOutput = "";

        proc.stdout.on("data", (data) => {
            output += data.toString();
        });

        proc.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(errorOutput || `Exited with code ${code}`));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

export async function getDockerLogs(containerId: string): Promise<string> {
    const cwd = getRootDir();

    return new Promise((resolve, reject) => {
        const proc = spawn("docker", ["logs", "--tail", "100", containerId], {
            cwd,
        });

        let output = "";

        proc.stdout.on("data", (data) => {
            output += data.toString();
        });

        // Docker logs often come through stderr
        proc.stderr.on("data", (data) => {
            output += data.toString();
        });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(output || `Exited with code ${code}`));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}