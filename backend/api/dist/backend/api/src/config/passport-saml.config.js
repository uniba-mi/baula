"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.samlStrategy = void 0;
const passport_saml_1 = require("@node-saml/passport-saml");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongo_1 = require("../database/mongo");
const crypto_1 = require("../shared/utils/crypto");
const spCert = fs_1.default.readFileSync(path_1.default.join(__dirname, "../certs", "sp_cert.pem"), "utf-8");
const spKey = fs_1.default.readFileSync(path_1.default.join(__dirname, "../certs", "sp_key.pem"), "utf-8");
const idpCert = fs_1.default.readFileSync(path_1.default.join(__dirname, "../certs", "idp_cert.pem"), "utf-8");
// Passport shib strategy configuration
exports.samlStrategy = new passport_saml_1.Strategy({
    callbackUrl: (_a = process.env.SAML_CALLBACK_URL) !== null && _a !== void 0 ? _a : "",
    entryPoint: (_b = process.env.SAML_ENTRY_POINT) !== null && _b !== void 0 ? _b : "",
    issuer: (_c = process.env.SAML_ISSUER) !== null && _c !== void 0 ? _c : "",
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
    const baId = profile["urn:oid:1.3.6.1.4.1.5923.1.1.1.6"];
    const id = baId
        ? (0, crypto_1.encrypt)(profile["urn:oid:1.3.6.1.4.1.5923.1.1.1.6"].split("@")[0])
        : "not set";
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
