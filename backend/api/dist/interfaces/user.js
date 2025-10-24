"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertUserRole = convertUserRole;
function convertUserRole(userRole) {
    // Konvertierer @ in eindeutige Nutzerrollen (z.B. employee, student usw.) und trenne vorher beim ; oder ,
    let roles = [];
    if (typeof userRole == "string") {
        // check for comma or semicolon
        const userRoles = userRole.split(";").length != 1
            ? userRole.split(";")
            : userRole.split(",");
        for (const role of userRoles) {
            roles.push(role.split("@")[0]);
        }
    }
    else {
        for (const role of userRole) {
            roles.push(role.split("@")[0]);
        }
    }
    return roles;
}
