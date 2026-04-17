import { executeCommandInDocker } from "./getDockerStatus.ts";
import type { Status } from "./StatusMode.ts";

export default async function checkApache(containerId: string): Promise<Status> {

    return new Promise<Status>(async (resolve, reject) => {
        const configTest = await executeCommandInDocker("apache2ctl configtest", containerId);
        console.log("configTest: ", configTest)
        const fullStatus = await executeCommandInDocker("apache2ctl fullstatus", containerId);

        const status: Status = {
            name: "apache2",
            status: "apache2ctl fullstatus: \n" + fullStatus,
            running: configTest.includes("Syntax OK")? true : false,
            message: "apache2ctl configtest: \n" + configTest
        }

        resolve(status);
    });
}