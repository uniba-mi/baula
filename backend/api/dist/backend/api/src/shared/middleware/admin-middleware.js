"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndReturnAdminUser = checkAndReturnAdminUser;
const mongo_1 = require("../../database/mongo");
async function checkAndReturnAdminUser(req, res, next) {
    const user = req.user;
    const isAdmin = await checkAdminRole(user);
    if (req.user && isAdmin) {
        next();
    }
    else {
        res.status(401).send("Unauthorized");
    }
}
async function checkAdminRole(user) {
    const dbUser = await mongo_1.User.findById(user._id).exec();
    return dbUser ? dbUser.roles.includes("admin") : false;
}
