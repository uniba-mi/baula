import { getRootDir } from "../helpers.ts";
import checkApache from "./checkApache.ts";
import checkApiNode from "./checkApiNode.ts";
import checkApiPython from "./checkApiPython.ts";
import checkMariaDB from "./checkMariaDB.ts";
import checkMongo from "./checkMongo.ts";
import checkRedis from "./checkRedis.ts";

import { spawn } from "child_process";
import getDockerStatus, { convertDockerPS } from "./getDockerStatus.ts";

import type { Status } from "./StatusMode.ts";

export default class CheckServicesSteps {
    containers: JSON[] = [];

    async init() {
        const dockerStatus = await getDockerStatus("docker ps");
        this.containers = convertDockerPS(dockerStatus);
    }

    flagToFunctions(flag: string, val: boolean): Function {
        if (!val) return () => { };
        switch (flag) {
            case "CHECK_API_PYTHON":
                return async () => { 
                    const status = await this.checkApiPython(); 
                    console.log(status) 
                };
            case "CHECK_API_NODE":
                return async () => {
                    const status = await this.checkApiNode();
                    console.log(status);
                }
            case "CHECK_APACHE":
                return async () => {
                    const status = await this.checkApache();
                    console.log(status);
                }
            case "CHECK_MONGO":
                return async () => {
                    const status = await this.checkMongo();
                    console.log(status);
                }
            case "CHECK_REDIS":
                return async () => {
                    const status = await this.checkRedis();
                    console.log(status);
                }
            case "CHECK_MARIADB":
                return async () => {
                    const status = await this.checkMariaDB();
                    console.log(status);
                }
            default:
                break;
        }
        return () => { }
    }

    async getDocker() {
        const cwd = getRootDir();

        const proc = spawn("docker", ["ps"], { cwd, stdio: "inherit", shell: true, });

        proc.on("close", (code) => {
            // Print what proc returned
            console.log(`Docker ps exited with code ${code}`);
        });

        proc.on("error", (err) => {
            console.error("Error occurred while running docker ps:", err);
        });
    }

    async checkApiPython() {
        const containerName = "baula-python";

        try {
            const baula_python = this.containers.find(c => c.image.includes(containerName));
            const status = await checkApiPython(baula_python.containerId);

            return status;
        } catch (error) {
            const errorStatus = this.createErrorStatus("API Python");
            errorStatus.message += (error instanceof Error ? error.message : String(error));

            return errorStatus;
        }
    }

    async checkApiNode() {
        const containerName = "baula-rest_api";
        try {
            const baula_rest_api = this.containers.find(c => c.image.includes(containerName));
            const status = await checkApiNode(baula_rest_api.containerId);

            return status;
        } catch (error) {
            const errorStatus = this.createErrorStatus("API Node");
            errorStatus.message += (error instanceof Error ? error.message : String(error));

            return errorStatus;
        }
    }

    async checkApache() {
        const containerName = "baula-server";
        try {
            const baula_server = this.containers.find(c => c.image.includes(containerName));
            const status = await checkApache(baula_server.containerId);

            return status;
        } catch (error) {
            const errorStatus = this.createErrorStatus("Apache");
            errorStatus.message += (error instanceof Error ? error.message : String(error));

            return errorStatus;
        }
    }

    async checkMongo() {
        const containerName = "mongo";
        try {
            const mongo = this.containers.find(c => c.image.includes(containerName));
            const status = await checkMongo(mongo.containerId);

            return status;
        } catch (error) {
            const errorStatus = this.createErrorStatus("MongoDB");
            errorStatus.message += (error instanceof Error ? error.message : String(error));

            return errorStatus;
        }
    }

    async checkRedis() {
        const containerName = "redis:alpine";
        try {
            const redis = this.containers.find(c => c.image.includes(containerName));
            const status = await checkRedis(redis.containerId);
            
            return status;
        } catch (error) {
            const errorStatus = this.createErrorStatus("Redis");
            errorStatus.message += (error instanceof Error ? error.message : String(error));

            return errorStatus;
        }
    }

    async checkMariaDB() {
        const containerName = "mariadb";
        try {
            const maria = this.containers.find(c => c.image.includes(containerName));
            const status = await checkMariaDB(maria.containerId);

            return status;
        } catch (error) {
            const errorStatus = this.createErrorStatus("MariaDB");
            errorStatus.message += (error instanceof Error ? error.message : String(error));

            return errorStatus;
        }
    }

    createErrorStatus(serviceName: string): Status {
        const status: Status = {
            name: serviceName,
            status: "The service may be running (or not), but its status could not be determined.",
            message: "Determined error: \n",
            running: false,
        }

        return status;
    }
}