"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const session_config_1 = require("./config/session.config");
const mongoose_1 = __importDefault(require("mongoose"));
const port = 3305;
// creates and starts server on port 3305
app_1.default.listen(port, () => {
    console.log(`Server listens on port ${port}`);
    const connectionMongoDB = mongoose_1.default.connection.readyState == 2
        ? "MongoDB connected!"
        : "Connection to MongoDB failed!";
    console.log(connectionMongoDB);
    session_config_1.redisClient.connect().then(() => console.log('Redis connected!')).catch(console.error);
});
