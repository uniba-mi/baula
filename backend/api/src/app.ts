/** ----------------------------
 *  ------- Imports ------------
    ---------------------------- */
import './config/env.config'
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { api } from "./routes/api.router";

import { authSaml } from "./routes/auth/auth-saml.routes";
import { localLogin, localLogout } from "./routes/auth/auth-local.routes";
import passport from "./config/passport.config";
import { expressSession } from "./config/session.config";
import { errorHandler, notFoundHandler } from "./shared/middleware/error-handler-middleware";

const app: Express = express();

// cors for local setting
if (process.env.NODE_ENV === "local" && process.env.ORIGIN) {
  app.use(
    cors({
      origin: [
        process.env.ORIGIN,
      ],
      credentials: true,
    })
  );
}

/** ------------------------------
 *  -- Configurating middleware --
 *  -----------------------------*/
app.use(express.urlencoded({ limit: "100mb", extended: true })); //false: only support simple bodys, true would support rich data
app.use(express.json({ limit: "100mb" })); //json data will be extracted
app.use(morgan("combined"));
mongoose.set("strictQuery", true); // strict query enables, that only schema-defined data is saved to mongodb

/** Helmet configuration */
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", process.env.PLAUSIBLE_URL ?? ""],
        styleSrc: ["'self'"],
      },
    },
    xssFilter: true,
  })
);

// session and passport configuration
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

/** ------------------------------
 *  ---------- Routes ------------
 *  -----------------------------*/
app.use('/login', localLogin);
app.use('/logout', localLogout);
app.use("/Shibboleth.sso", authSaml);
app.use("/api", api);

/** ------------------------------
 *  ------ Error handling --------
 *  -----------------------------*/
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
