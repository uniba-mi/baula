import { executeCommandInDocker, getDockerLogs } from "./getDockerStatus.ts";
import type { Status } from "./StatusMode.ts";

export default async function checkRedis(containerId: string): Promise<Status>  {
    return new Promise<Status>(async (resolve, reject) => {
        const logs = await getDockerLogs(containerId);
        const redisCliInfo = await executeCommandInDocker("redis-cli info", containerId);
        
        const status = convertToStatus(logs, redisCliInfo);
        
        resolve(status);
    });
}

function convertToStatus(logs: string, cliInfo: string): Status {
    const status: Status = {
        name: "Redis",
        running: logs.includes("Ready to accept connections"),
        status: cliInfo,
        message: logs
    }

    return status;
}