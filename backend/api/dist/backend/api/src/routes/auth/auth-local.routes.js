"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localLogout = exports.localLogin = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const authenticationMiddleware_1 = require("../../shared/middleware/authenticationMiddleware");
const loginRouter = express_1.default.Router();
exports.localLogin = loginRouter;
const logoutRouter = express_1.default.Router();
exports.localLogout = logoutRouter;
loginRouter.use(express_1.default.json());
logoutRouter.use(express_1.default.json());
loginRouter.post("/local", auth_controller_1.localLogin);
logoutRouter.post("/", authenticationMiddleware_1.ensureAuthenticated, auth_controller_1.localLogout);
