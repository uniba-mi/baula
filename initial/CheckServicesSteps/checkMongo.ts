import { executeCommandInDocker, getDockerInspect } from "./getDockerStatus.ts";
import type { Status } from "./StatusMode.ts";

export default async function checkMongo(containerId: string): Promise<Status> {
    return new Promise<Status>(async (resolve, reject) => {
        const inspectMessage = await getDockerInspect(containerId);

        const status = inspectToStatus(inspectMessage);

        resolve(status);
    });
}

function inspectToStatus(inspect: string): Status {
    const parsed = JSON.parse(inspect)[0];

    const status: Status = {
        name: "MongoDB",
        running: parsed?.State?.Running,
        status: parsed?.State,
    }

    return status;
}