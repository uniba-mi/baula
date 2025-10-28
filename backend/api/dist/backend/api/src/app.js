"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** ----------------------------
 *  ------- Imports ------------
    ---------------------------- */
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_saml_1 = require("@node-saml/passport-saml");
const passport_local_1 = require("passport-local");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const api_router_1 = require("./routes/api.router");
const public_router_1 = require("./routes/public/public.router");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongo_1 = require("./database/mongo");
const dotenv = __importStar(require("dotenv"));
const validator_1 = __importDefault(require("validator"));
const error_1 = require("./shared/error");
const connect_redis_1 = require("connect-redis");
const redis_1 = require("redis");
const crypto_1 = require("./shared/crypto");
const demoMiddleware_1 = require("./shared/middleware/demoMiddleware");
const constants_1 = require("./shared/constants");
const authenticationMiddleware_1 = require("./shared/middleware/authenticationMiddleware");
/** -----------------------------
 *  --- Initializing constants --
 *  -----------------------------*/
dotenv.config({ path: path_1.default.resolve(__dirname, "../", "environment", '.env.backend') });
const app = (0, express_1.default)();
const port = 3305;
const spCert = fs_1.default.readFileSync(path_1.default.join(__dirname, "certs", "sp_cert.pem"), "utf-8");
const spKey = fs_1.default.readFileSync(path_1.default.join(__dirname, "certs", "sp_key.pem"), "utf-8");
const idpCert = fs_1.default.readFileSync(path_1.default.join(__dirname, "certs", "idp_cert.pem"), "utf-8");
// Dummy user database
const users = constants_1.USERS;
/** ------------------------------
 *  -- Configurating middleware --
 *  -----------------------------*/
//false: only support simple bodys, true would support rich data
app.use(express_1.default.urlencoded({ limit: "100mb", extended: true }));
//json data will be extracted
app.use(express_1.default.json({ limit: "100mb" }));
app.disable("x-powered-by");
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://plausible.stats.baula.minf.uni-bamberg.de"],
            styleSrc: ["'self'"],
        },
    },
    xssFilter: true,
}));
if (process.env.NODE_ENV === "local") {
    app.use((0, cors_1.default)({
        origin: [
            process.env.ORIGIN ? process.env.ORIGIN : "",
            "https://idp.iam.uni-bamberg.de/idp",
        ],
        credentials: true,
    }));
}
app.use((0, morgan_1.default)("combined"));
// strict query enables, that only schema-defined data is saved to mongodb
mongoose_1.default.set("strictQuery", true);
// configurate redis 
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL
});
// session management
app.use((0, express_session_1.default)({
    store: new connect_redis_1.RedisStore({ client: redisClient }),
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
}));
/** ------------------------------
 *  ---- Initialize passport -----
 *  -----------------------------*/
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Passport local strategy configuration
passport_1.default.use(new passport_local_1.Strategy(async (username, password, done) => {
    const name = validator_1.default.isAlphanumeric(username, "de-DE", { ignore: "." })
        ? username
        : undefined;
    const pw = validator_1.default.isAscii(password) ? password : undefined;
    // check validity of request
    if (name && pw) {
        const user = users.find((u) => u.username === name && u.password === pw);
        if (!user) {
            return done(null, false, {
                message: "Incorrect username or password.",
            });
        }
        // check if user exists in database and if not, create it
        let dbUser = await mongo_1.User.findOne().byShibId(user.shibId).exec();
        const roles = user.roles;
        if (!dbUser) {
            const shibId = user.shibId;
            dbUser = {
                shibId: shibId,
                roles: roles,
                authType: "local",
            };
        }
        else {
            // check if roles changed
            if (roles.toString().length != dbUser.roles.toString().length) {
                dbUser = await mongo_1.User.findByIdAndUpdate(dbUser._id, {
                    $set: {
                        roles: roles
                    },
                });
            }
        }
        return done(null, { user: dbUser, baId: (0, crypto_1.encrypt)('test') });
    }
    else {
        return done(new error_1.BadRequestError());
    }
}));
// Passport shib strategy configuration
const samlStrategy = new passport_saml_1.Strategy({
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
}, async (profile, done) => {
    let user = await mongo_1.User.findOne().byShibId(profile.nameID).exec();
    const baId = profile['urn:oid:1.3.6.1.4.1.5923.1.1.1.6'];
    const id = baId ? (0, crypto_1.encrypt)(profile['urn:oid:1.3.6.1.4.1.5923.1.1.1.6'].split("@")[0]) : 'not set';
    if (!user) {
        const shibId = profile.nameID;
        const roles = profile["urn:oid:1.3.6.1.4.1.5923.1.1.1.9"].map((role) => role.split("@")[0]);
        user = {
            shibId: shibId,
            roles: roles,
            authType: "saml",
        };
    }
    return done(null, { user, baId: id });
}, (profile, done) => {
    // wird nie getriggert
    return done(null, profile);
});
passport_1.default.use(samlStrategy);
passport_1.default.serializeUser((profile, done) => {
    done(null, { baId: profile.baId, shibId: profile.user.shibId, roles: profile.user.roles, authType: profile.user.authType });
});
passport_1.default.deserializeUser(async (ids, done) => {
    // try to find user in static user table
    let user = await mongo_1.User.findOne().byShibId(ids.shibId).exec();
    if (!user && ids.baId && ids.shibId) {
        // set user to minimal user
        user = {
            shibId: ids.shibId,
            roles: ids.roles,
            authType: ids.authType
        };
    }
    done(null, user);
});
/** ------------------------------
 *  ------- Login Routes ---------
 *  -----------------------------*/
app.post("/login/local", (req, res, next) => {
    passport_1.default.authenticate("local", (err, user, info) => {
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
app.get("/Shibboleth.sso/Login", passport_1.default.authenticate("saml", { failureRedirect: process.env.LOGIN_PAGE_URL }));
app.post("/Shibboleth.sso/SAML2/POST", passport_1.default.authenticate("saml", {
    failureRedirect: process.env.LOGIN_PAGE_URL,
}), (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Login failed" });
    }
    return res.redirect(process.env.DASHBOARD_URL
        ? process.env.DASHBOARD_URL
        : "https://baula.minf.uni-bamberg.de/app/");
});
/**---------------------------------------------
 * --------------- Logout Routes ---------------
 ** ---------------------------------------------*/
// local logout
app.post("/logout", authenticationMiddleware_1.ensureAuthenticated, (req, res) => {
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
app.get("/Shibboleth.sso/Logout", authenticationMiddleware_1.ensureAuthenticated, (req, res) => {
    let user = req.user;
    if (!req.user) {
        return res.json({ success: false });
    }
    const samlReq = Object.assign({}, req, {
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
            }
            else {
                // return status to client and redirect from there -> direct redirect is not working
                res.json({ success: true, requestUrl });
            }
        });
    });
});
// IdP-initiated Logout and redirect from idp
app.get("/Shibboleth.sso/SLO/Redirect", (req, res) => {
    // in all cases the local session should be killed
    req.logout((err) => {
        var _a;
        if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Failed to logout" });
        }
        // read saml request
        (_a = samlStrategy._saml) === null || _a === void 0 ? void 0 : _a.validateRedirectAsync(req.query, req.originalUrl.split("?")[1]).then((value) => {
            var _a;
            // value is needed to check, if profile is set (idp initiated logout) or not (sp initiated logout)
            if (value.profile !== null) {
                // idp initiated logout
                const relayState = (req.query && req.query.RelayState) ||
                    (req.body && req.body.RelayState);
                (_a = samlStrategy._saml) === null || _a === void 0 ? void 0 : _a.getLogoutResponseUrl(value.profile, relayState, {}, true, (err, url) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ success: false, message: "Failed to logout" });
                    }
                    if (url) {
                        // pass logout response to idp
                        res.redirect(url);
                    }
                    else {
                        return res
                            .status(500)
                            .json({ success: false, message: "Failed to logout" });
                    }
                });
            }
            else {
                // redirect from idp, only send back success
                res.sendStatus(200);
            }
        });
    });
});
/** ------------------------------
 *  ---------- Routes ------------
 *  -----------------------------*/
app.use("/api", authenticationMiddleware_1.ensureAuthenticated, demoMiddleware_1.denyDemoWrites, api_router_1.api);
app.use("/public", public_router_1.formdata);
/** ------------------------------
 *  ------ Error handling --------
 *  -----------------------------*/
//We are here, that means: None of the routes fit the request --> Handle the request that made it until here
app.use((req, res, next) => {
    //Error object available by default
    const error = new Error("Not Found");
    next(error); //forward error request instead of original request
});
app.use((err, req, res, next) => {
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
app.use((err, req, res, next) => {
    (0, error_1.logError)(err);
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
    const connectionMongoDB = mongoose_1.default.connection.readyState == 2
        ? "MongoDB connected!"
        : "Connection to MongoDB failed!";
    console.log(connectionMongoDB);
    redisClient.connect().then(() => console.log('Redis connected!')).catch(console.error);
});
exports.default = app;
