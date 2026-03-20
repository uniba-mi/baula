import { executeCommandInDocker } from "./getDockerStatus.ts";
import type { Status } from "./StatusMode.ts";

export default async function checkApiNode(containerId: string): Promise<Status[]> {

    return new Promise<Status[]>(async (resolve, reject) => {
        let statusMessage = await executeCommandInDocker("pm2 status", containerId);
        const status = convertMessageToStatus(statusMessage);
        resolve(status);
    });
}

function convertMessageToStatus(message: string): Status[] {
    const lines = message.split("\n");

    // keep only data rows (start with │ and contain values, not header/separator)
    const dataLines = lines.filter(line =>
        line.startsWith("│") &&
        !line.includes("id") &&
        !line.includes("────")
    );

    const result = dataLines.map(line => {
        const cols = line
            .split("│")
            .map(c => c.trim())
            .filter(Boolean);

        return {
            name: cols[1],
            status: cols[8],
        };
    });

    const status: Status[] = [];
    for (let el of result) {
        const statusEntry: Status = {
            name: el.name,
            status: el.status,
            running: el.status.toLowerCase() === "online",
        }
        status.push(statusEntry);
    }

    return status;
}