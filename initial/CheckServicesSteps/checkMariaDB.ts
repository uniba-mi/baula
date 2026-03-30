import { executeCommandInDocker, getDockerLogs } from "./getDockerStatus.ts";
import type { Status } from "./StatusMode.ts";

export default async function checkMariaDB(containerId: string): Promise<Status> {
    return new Promise<Status>(async (resolve, reject) => {
        const logs = await getDockerLogs(containerId);
        const status = logsToStatus(logs);
        resolve(status);
    });
}

function logsToStatus(logs: string): Status {
    const status: Status = {
        name: "MariaDB",
        running: logs.includes("mariadbd: ready for connections"),
        status: "",
        message: logs
    }

    return status;
}