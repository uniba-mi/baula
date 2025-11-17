"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** ----------------------------
 *  ------- Imports ------------
    ---------------------------- */
require("./config/env.config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const api_router_1 = require("./routes/api.router");
const auth_saml_routes_1 = require("./routes/auth/auth-saml.routes");
const auth_local_routes_1 = require("./routes/auth/auth-local.routes");
const passport_config_1 = __importDefault(require("./config/passport.config"));
const session_config_1 = require("./config/session.config");
const error_handler_middleware_1 = require("./shared/middleware/error-handler-middleware");
const app = (0, express_1.default)();
// cors for local setting
if (process.env.NODE_ENV === "local") {
    app.use((0, cors_1.default)({
        origin: [
            process.env.ORIGIN ? process.env.ORIGIN : "",
            "https://idp.iam.uni-bamberg.de/idp",
        ],
        credentials: true,
    }));
}
/** ------------------------------
 *  -- Configurating middleware --
 *  -----------------------------*/
app.use(express_1.default.urlencoded({ limit: "100mb", extended: true })); //false: only support simple bodys, true would support rich data
app.use(express_1.default.json({ limit: "100mb" })); //json data will be extracted
app.use((0, morgan_1.default)("combined"));
mongoose_1.default.set("strictQuery", true); // strict query enables, that only schema-defined data is saved to mongodb
/** Helmet configuration */
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
// session and passport configuration
app.use(session_config_1.expressSession);
app.use(passport_config_1.default.initialize());
app.use(passport_config_1.default.session());
/** ------------------------------
 *  ---------- Routes ------------
 *  -----------------------------*/
app.use('/login', auth_local_routes_1.localLogin);
app.use('/logout', auth_local_routes_1.localLogout);
app.use("/Shibboleth.sso", auth_saml_routes_1.authSaml);
app.use("/api", api_router_1.api);
/** ------------------------------
 *  ------ Error handling --------
 *  -----------------------------*/
app.use(error_handler_middleware_1.notFoundHandler);
app.use(error_handler_middleware_1.errorHandler);
exports.default = app;
