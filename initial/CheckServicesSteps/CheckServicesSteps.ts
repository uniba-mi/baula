import checkApache from "./checkApache.ts";
import checkApiNode from "./checkApiNode.ts";
import checkApiPython from "./checkApiPython.ts";
import checkMariaDB from "./checkMariaDB.ts";
import checkMongo from "./checkMongo.ts";
import checkRedis from "./checkRedis.ts";


export default class CheckServicesSteps {
    flagToFunctions(flag: string, val: boolean): Function {
        if (!val) return () => { };
        switch (flag) {
            case "CHECK_API_PYTHON":
                return this.checkApiPython;
            case "CHECK_API_NODE":
                return this.checkApiNode;
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

    async checkApiPython() {
        try {
            await checkApiPython();
        } catch (error) {

        }
    }

    async checkApiNode() {
        try {
            await checkApiNode();
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