"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denyDemoWrites = denyDemoWrites;
function denyDemoWrites(req, res, next) {
    const forbiddenMethods = ["POST", "PUT", "DELETE"];
    const user = req.user;
    if (user && user.roles.includes("demo") && forbiddenMethods.includes(req.method)) {
        return res.status(403).json({
            message: "Aktion für Demo-Nutzer nicht erlaubt."
        });
    }
    // ansonsten weiter
    next();
}
