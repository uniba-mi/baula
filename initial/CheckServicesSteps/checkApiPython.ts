import { executeCommandInDocker, getDockerLogs } from "./getDockerStatus.ts";
import type { Status } from "./StatusMode.ts";

export default async function checkApiPython(containerId: string): Promise<Status> {

    return new Promise<Status>(async (resolve, reject) => {
        try {
            const logs = await getDockerLogs(containerId);
            const status = convertLogsToStatus(logs);
            resolve(status);
            
        } catch (error) {
            reject(error);
        }
    });
}

function convertLogsToStatus(logs: string): Status {
    const running = logs.includes("Application startup complete");

    const status: Status = {
        running: running,
        message: logs,
        name: "baula-python",
        status: logs.split("\n").pop()?.toString() ?? "ERROR IN STATUS MESSAGE EXTRACTION"
    }
    return status;
}