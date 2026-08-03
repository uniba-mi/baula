import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import { localLogin, localLogout } from "./auth.controller";
import { ensureAuthenticated } from "../../shared/middleware/authentication-middleware";

const loginRouter: Router = express.Router();
const logoutRouter: Router = express.Router();
loginRouter.use(express.json());
logoutRouter.use(express.json());

const localLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Zu viele Loginversuche. Bitte später erneut versuchen.",
});

loginRouter.post("/local", localLoginLimiter, localLogin);

logoutRouter.post("/", ensureAuthenticated, localLogout)

export { loginRouter as localLogin, logoutRouter as localLogout };