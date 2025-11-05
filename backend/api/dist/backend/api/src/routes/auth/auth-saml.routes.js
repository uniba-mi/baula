"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSaml = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const authenticationMiddleware_1 = require("../../shared/middleware/authenticationMiddleware");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
exports.authSaml = router;
router.use(express_1.default.json());
// login routes
router.get("/Login", passport_1.default.authenticate("saml", { failureRedirect: process.env.LOGIN_PAGE_URL }));
router.post("/SAML2/POST", passport_1.default.authenticate("saml", {
    failureRedirect: process.env.LOGIN_PAGE_URL,
}), auth_controller_1.loginRedirect);
// Logout routes
router.get("/SLO/Redirect", auth_controller_1.idpInitiatedLogout);
router.get("/Logout", authenticationMiddleware_1.ensureAuthenticated, auth_controller_1.spInitiatedLogout);
