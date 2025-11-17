"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localStrategy = void 0;
const passport_local_1 = require("passport-local");
const validator_1 = __importDefault(require("validator"));
const users_1 = require("../shared/constants/users");
const mongo_1 = require("../database/mongo");
const crypto_1 = require("../shared/utils/crypto");
const error_1 = require("../shared/error");
// Dummy user database
const users = users_1.USERS;
// Passport local strategy configuration
exports.localStrategy = new passport_local_1.Strategy(async (username, password, done) => {
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
                        roles: roles,
                    },
                });
            }
        }
        return done(null, { user: dbUser, baId: (0, crypto_1.encrypt)("test") });
    }
    else {
        return done(new error_1.BadRequestError());
    }
});
