import express, { Router } from "express";
import {
  idpInitiatedLogout,
  loginRedirect,
  spInitiatedLogout,
} from "./auth.controller";
import { ensureAuthenticated } from "../../shared/middleware/authenticationMiddleware";
import passport from "passport";

const router: Router = express.Router();
router.use(express.json());

// login routes
router.get("/Login", passport.authenticate("saml", { failureRedirect: process.env.LOGIN_PAGE_URL }));
router.post(
  "/SAML2/POST",
  passport.authenticate("saml", {
    failureRedirect: process.env.LOGIN_PAGE_URL,
  }),
  loginRedirect
);

// Logout routes
router.get("/SLO/Redirect", idpInitiatedLogout);
router.get("/Logout", ensureAuthenticated, spInitiatedLogout);

export { router as authSaml };
