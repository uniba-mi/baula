import { Strategy as SamlStrategy } from "@node-saml/passport-saml";
import fs from "fs";
import path from "path";
import { User } from "../database/mongo";
import { encrypt } from "../shared/utils/crypto";

const spCert = fs.readFileSync(
  path.join(__dirname, "../certs", "sp_cert.pem"),
  "utf-8"
);
const spKey = fs.readFileSync(
  path.join(__dirname, "../certs", "sp_key.pem"),
  "utf-8"
);
const idpCert = fs.readFileSync(
  path.join(__dirname, "../certs", "idp_cert.pem"),
  "utf-8"
);

// Passport shib strategy configuration
export const samlStrategy = new SamlStrategy(
  {
    callbackUrl: process.env.SAML_CALLBACK_URL ?? "",
    entryPoint: process.env.SAML_ENTRY_POINT ?? "",
    issuer: process.env.SAML_ISSUER ?? "",
    decryptionPvk: spKey,
    publicCert: spCert,
    idpCert: idpCert,
    logoutUrl: process.env.SAML_LOGOUT_URL,
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
    const baId = profile["urn:oid:1.3.6.1.4.1.5923.1.1.1.6"];
    const id = baId
      ? encrypt(profile["urn:oid:1.3.6.1.4.1.5923.1.1.1.6"].split("@")[0])
      : "not set";
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
