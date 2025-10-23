/** ----------------------------
 *  ------- Imports ------------
    ---------------------------- */
import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as SamlStrategy } from "@node-saml/passport-saml";
import { Strategy as LocalStrategy } from "passport-local";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { api } from "./routes/api.router";
import { formdata } from "./routes/public/public.router";
import fs from "fs";
import path from "path";
import { User } from "./database/mongo";
import * as dotenv from "dotenv";
import validator from "validator";
import { RequestWithUser } from "@node-saml/passport-saml/lib/types";
import { BadRequestError, logError } from "./shared/error";
import { RedisStore } from "connect-redis";
import { createClient } from 'redis';
import { encrypt } from "./shared/crypto";
import { denyDemoWrites } from "./shared/middleware/demoMiddleware";
import { USERS } from "./shared/constants";
import { ensureAuthenticated } from "./shared/middleware/authenticationMiddleware";

/** -----------------------------
 *  --- Initializing constants --
 *  -----------------------------*/
const envFile = `.env.${process.env.NODE_ENV || "local"}`;
console.log(envFile); // for testing to check if correct env file is loaded
dotenv.config({ path: path.resolve(__dirname, "../", "environment", envFile) });

const app: Express = express();
const port = 3305;
const spCert = fs.readFileSync(
  path.join(__dirname, "certs", "sp_cert.pem"),
  "utf-8"
);
const spKey = fs.readFileSync(
  path.join(__dirname, "certs", "sp_key.pem"),
  "utf-8"
);
const idpCert = fs.readFileSync(
  path.join(__dirname, "certs", "idp_cert.pem"),
  "utf-8"
);

// Dummy user database
const users = USERS;

/** ------------------------------
 *  -- Configurating middleware --
 *  -----------------------------*/
//false: only support simple bodys, true would support rich data
app.use(express.urlencoded({ limit: "100mb", extended: true }));
//json data will be extracted
app.use(express.json({ limit: "100mb" }));

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://plausible.stats.baula.minf.uni-bamberg.de"],
        styleSrc: ["'self'"],
      },
    },
    xssFilter: true,
  })
);
if (process.env.NODE_ENV === "local") {
  app.use(
    cors({
      origin: [
        process.env.ORIGIN ? process.env.ORIGIN : "http://localhost:4200",
        "https://idp.iam.uni-bamberg.de/idp",
      ],
      credentials: true,
    })
  );
}

app.use(morgan("combined"));
// strict query enables, that only schema-defined data is saved to mongodb
mongoose.set("strictQuery", true);

// configurate redis 
const redisClient = createClient({
  url: process.env.REDIS_URL
});

// session management
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : "",
    name: process.env.SESSION_NAME ? process.env.SESSION_NAME : "baulaSession",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.COOKIE_SECURE === "true" ? true : false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000,
      sameSite: true,
    },
  })
);

/** ------------------------------
 *  ---- Initialize passport -----
 *  -----------------------------*/
app.use(passport.initialize());
app.use(passport.session());


// Passport local strategy configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const name = validator.isAlphanumeric(username, "de-DE", { ignore: "." })
      ? username
      : undefined;
    const pw = validator.isAscii(password) ? password : undefined;

    // check validity of request
    if (name && pw) {
      const user = users.find((u) => u.username === name && u.password === pw);
      if (!user) {
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      }
      // check if user exists in database and if not, create it
      let dbUser = await User.findOne().byShibId(user.shibId).exec();
      const roles = user.roles;
      if (!dbUser) {
        const shibId = user.shibId;
        dbUser = {
          shibId: shibId,
          roles: roles,
          authType: "local",
        };
      } else {
        // check if roles changed
        if(roles.toString().length != dbUser.roles.toString().length) {
          dbUser = await User.findByIdAndUpdate(dbUser._id, {
            $set: {
              roles: roles
            },
          })
        }
      }
      return done(null, { user: dbUser, baId: encrypt('ba031941') });
    } else {
      return done(new BadRequestError());
    }
  })
);

// Passport shib strategy configuration
const samlStrategy = new SamlStrategy(
  {
    callbackUrl: process.env.SAML_CALLBACK_URL
      ? process.env.SAML_CALLBACK_URL
      : "",
    entryPoint: process.env.SAML_ENTRY_POINT
      ? process.env.SAML_ENTRY_POINT
      : "",
    issuer: process.env.SAML_ISSUER ? process.env.SAML_ISSUER : "",
    decryptionPvk: spKey,
    publicCert: spCert,
    idpCert: idpCert,
    logoutUrl: "https://idp.iam.uni-bamberg.de/idp/profile/SAML2/Redirect/SLO",
    logoutCallbackUrl: process.env.LOGOUT_CALLBACK_URL,
    identifierFormat: null,
    authnContext: [
      "urn:oasis:names:tc:SAML:2.0:ac:classes:X509",
      "urn:oasis:names:tc:SAML:2.0:ac:classes:Kerberos",
      "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
    ],
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256",
    wantAssertionsSigned: false,
    forceAuthn: true,
    wantAuthnResponseSigned: true,
  },
  async (profile: any, done: any) => {
    let user = await User.findOne().byShibId(profile.nameID).exec();
    const id = 'test'; //encrypt(profile['urn:oid:1.3.6.1.4.1.5923.1.1.1.6'].split("@")[0]);
    if (!user) {
      const shibId = profile.nameID;
      const roles = profile["urn:oid:1.3.6.1.4.1.5923.1.1.1.9"].map(
        (role: string) => role.split("@")[0]
      );
      user = {
        shibId: shibId,
        roles: roles,
        authType: "saml",
      };
    }
    return done(null, { user, baId: id });
  },
  (profile: any, done: any) => {
    // wird nie getriggert
    return done(null, profile);
  }
);

passport.use(samlStrategy);

passport.serializeUser((profile: any, done) => {
  done(null, { baId: profile.baId, shibId: profile.user.shibId, roles: profile.user.roles, authType: profile.user.authType });
});

passport.deserializeUser(async (ids: { baId: string, shibId: string, roles: string[], authType: string }, done) => {
  // try to find user in static user table
  let user = await User.findOne().byShibId(ids.shibId).exec();
  if(!user && ids.baId && ids.shibId) {
    // set user to minimal user
    user = {
      shibId: ids.shibId,
      roles: ids.roles,
      authType: ids.authType
    }
  }
  done(null, user);
});

/** ------------------------------
 *  ------- Login Routes ---------
 *  -----------------------------*/
app.post("/login/local", (req, res, next) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send("Login failed");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).send(user);
    });
  })(req, res, next);
});

app.get(
  "/Shibboleth.sso/Login",
  passport.authenticate("saml", { failureRedirect: process.env.LOGIN_PAGE_URL })
);

app.post(
  "/Shibboleth.sso/SAML2/POST",
  passport.authenticate("saml", {
    failureRedirect: process.env.LOGIN_PAGE_URL,
  }),
  (req, res) => {
    if (!req.user) {
      return res.status(401).send({ success: false, message: "Login failed" });
    }
    return res.redirect(
      process.env.DASHBOARD_URL
        ? process.env.DASHBOARD_URL
        : "https://baula.minf.uni-bamberg.de/app/"
    );
  }
);

/**---------------------------------------------
 * --------------- Logout Routes ---------------
 ** ---------------------------------------------*/
// local logout
app.post("/logout", ensureAuthenticated, (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to logout" });
    }
    res.json({ success: true });
  });
});

// SP-initiated Logout
app.get(
  "/Shibboleth.sso/Logout",
  ensureAuthenticated,
  (req: Request, res: Response) => {
    let user: any = req.user;

    if (!req.user) {
      return res.json({ success: false });
    }
    const samlReq: RequestWithUser = Object.assign({}, req, {
      samlLogoutRequest: {
        issuer: "https://idp.rz.uni-bamberg.de/idp/shibboleth",
        nameID: user.shibId,
        nameIDFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
      },
      user: {
        ...user,
        nameID: user.shibId,
        nameIDFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
      },
    });
    // logout on sp
    req.logout((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to logout" });
      }
      
      // samlStrategy.logout triggers the logout on idp and generates and sends logoutRequest to idp
      samlStrategy.logout(samlReq, (err, requestUrl) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).send("Could not log out");
        }
        if (!requestUrl) {
          // return true to show client that local logout worked
          res.json({ success: true });
        } else {
          // return status to client and redirect from there -> direct redirect is not working
          res.json({ success: true, requestUrl });
        }
      });
    })
  }
);

// IdP-initiated Logout and redirect from idp
app.get("/Shibboleth.sso/SLO/Redirect", (req: Request, res: Response) => {
  // in all cases the local session should be killed
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to logout" });
    }
    // read saml request
    samlStrategy._saml
      ?.validateRedirectAsync(req.query, req.originalUrl.split("?")[1])
      .then((value) => {
        // value is needed to check, if profile is set (idp initiated logout) or not (sp initiated logout)
        if (value.profile !== null) {
          // idp initiated logout
          const relayState =
            (req.query && req.query.RelayState) ||
            (req.body && req.body.RelayState);
          samlStrategy._saml?.getLogoutResponseUrl(
            value.profile,
            relayState,
            {},
            true,
            (err, url) => {
              if (err) {
                return res
                  .status(500)
                  .json({ success: false, message: "Failed to logout" });
              }
              if (url) {
                // pass logout response to idp
                res.redirect(url);
              } else {
                return res
                  .status(500)
                  .json({ success: false, message: "Failed to logout" });
              }
            }
          );
        } else {
          // redirect from idp, only send back success
          res.sendStatus(200);
        }
      });
  });
});

/** ------------------------------
 *  ---------- Routes ------------
 *  -----------------------------*/

app.use("/api", ensureAuthenticated, denyDemoWrites, api);
app.use("/public", formdata);

/** ------------------------------
 *  ------ Error handling --------
 *  -----------------------------*/
//We are here, that means: None of the routes fit the request --> Handle the request that made it until here
app.use((req: Request, res: Response, next: NextFunction) => {
  //Error object available by default
  const error = new Error("Not Found");
  next(error); //forward error request instead of original request
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  switch (err.name) {
    case "UnauthorizedError":
      res.status(401).send("Invalid Request");
      break;
    case "NotFoundError":
      res.status(404).send(err.message);
      break;
    case "BadRequestError":
      res.status(400).send(err.message);
      break;
    default:
      next(err);
      break;
  }
});

//this handles all errors: either the passed ohne (error) or errors that happen anywhere in the application; for that: 500
//esp. for failed database operations
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logError(err);
  console.error(err.stack); // Log the error stack trace for debugging purposes
  res.status(500).json({
    error: {
      name: err.name,
      message: err.message,
    },
  });
});

// creates and starts server on port 3305
app.listen(port, () => {
  console.log(`Server listens on port ${port}`);
  redisClient.connect().then(() => console.log('Redis connected!')).catch(console.error);
});

export default app;
