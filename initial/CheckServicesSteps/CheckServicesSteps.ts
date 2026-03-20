import { getRootDir } from "../helpers.ts";
import checkApache from "./checkApache.ts";
import checkApiNode from "./checkApiNode.ts";
import checkApiPython from "./checkApiPython.ts";
import checkMariaDB from "./checkMariaDB.ts";
import checkMongo from "./checkMongo.ts";
import checkRedis from "./checkRedis.ts";

import { spawn } from "child_process";
import getDockerStatus, { convertDockerPS, executeCommandInDocker } from "./getDockerStatus.ts";

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
                return () => this.checkApiPython();
            case "CHECK_API_NODE":
                return () => this.checkApiNode();
            case "CHECK_APACHE":
                return this.checkApache;
            case "CHECK_MONGO":
                return this.checkMongo;
            case "CHECK_REDIS":
                return this.checkRedis;
            case "CHECK_MARIADB":
                return this.checkMariaDB;
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
            console.log("Python status: ", status)
        } catch (error) {
            console.error(error);
        }
    }

    async checkApiNode() {
        const containerName = "baula-rest_api";
        try {
            const baula_rest_api = this.containers.find(c => c.image.includes(containerName));
            const status = await checkApiNode(baula_rest_api.containerId);
            console.log("STATUS:", status)
        } catch (error) {
            console.error("API Node check failed:", error);
        }
    }

    async checkApache() {
        try {
            await checkApache();
        } catch (error) {

        }
    }

    async checkMongo() {
        try {
            await checkMongo();
        } catch (error) {

        }
    }

    async checkRedis() {
        try {
            await checkRedis();
        } catch (error) {

        }
    }

    async checkMariaDB() {
        try {
            await checkMariaDB();
        } catch (error) {

        }
    }
}