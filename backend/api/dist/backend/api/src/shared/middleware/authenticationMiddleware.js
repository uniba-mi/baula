"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send("Unauthorized");
}
