"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const mongo_1 = require("../database/mongo");
const passport_saml_config_1 = require("./passport-saml.config");
const passport_local_config_1 = require("./passport-local.config");
/** ------------------------------
 *  ---- Initialize passport -----
 *  -----------------------------*/
passport_1.default.use(passport_saml_config_1.samlStrategy);
passport_1.default.use(passport_local_config_1.localStrategy);
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
exports.default = passport_1.default;
