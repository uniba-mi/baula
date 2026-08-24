import express, { Router } from "express";
import { localLogin, localLogout } from "./auth.controller";
import { ensureAuthenticated } from "../../shared/middleware/authentication-middleware";

const loginRouter: Router = express.Router();
const logoutRouter: Router = express.Router();
loginRouter.use(express.json());
logoutRouter.use(express.json());

loginRouter.post("/local", localLogin);

logoutRouter.post("/", ensureAuthenticated, localLogout)

export { loginRouter as localLogin, logoutRouter as localLogout };