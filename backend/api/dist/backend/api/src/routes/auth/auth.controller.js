"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localLogin = localLogin;
exports.loginRedirect = loginRedirect;
exports.spInitiatedLogout = spInitiatedLogout;
exports.idpInitiatedLogout = idpInitiatedLogout;
exports.localLogout = localLogout;
const passport_saml_config_1 = require("../../config/passport-saml.config");
const passport_1 = __importDefault(require("passport"));
// Local login
function localLogin(req, res, next) {
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
}
;
function loginRedirect(req, res) {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Login failed" });
    }
    return res.redirect(process.env.DASHBOARD_URL
        ? process.env.DASHBOARD_URL
        : "https://baula.minf.uni-bamberg.de/app/");
}
/**---------------------------------------------
 * --------------- Logout Routes ---------------
 ** ---------------------------------------------*/
// SP-initiated Logout
function spInitiatedLogout(req, res) {
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
        passport_saml_config_1.samlStrategy.logout(samlReq, (err, requestUrl) => {
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
}
// IdP-initiated Logout and redirect from idp
function idpInitiatedLogout(req, res) {
    // in all cases the local session should be killed
    req.logout((err) => {
        var _a;
        if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Failed to logout" });
        }
        // read saml request
        (_a = passport_saml_config_1.samlStrategy._saml) === null || _a === void 0 ? void 0 : _a.validateRedirectAsync(req.query, req.originalUrl.split("?")[1]).then((value) => {
            var _a;
            // value is needed to check, if profile is set (idp initiated logout) or not (sp initiated logout)
            if (value.profile !== null) {
                // idp initiated logout
                const relayState = (req.query && req.query.RelayState) ||
                    (req.body && req.body.RelayState);
                (_a = passport_saml_config_1.samlStrategy._saml) === null || _a === void 0 ? void 0 : _a.getLogoutResponseUrl(value.profile, relayState, {}, true, (err, url) => {
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
}
// local logout
function localLogout(req, res) {
    req.logout((err) => {
        if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Failed to logout" });
        }
        res.json({ success: true });
    });
}
;
