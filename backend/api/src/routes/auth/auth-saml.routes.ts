import express, { Router } from "express";
import {
  idpInitiatedLogout,
  loginFailureRedirect,
  loginRedirect,
  spInitiatedLogout,
} from "./auth.controller";
import { ensureAuthenticated } from "../../shared/middleware/authentication-middleware";
import passport from "passport";

const router: Router = express.Router();
router.use(express.json());

// Login routes
router.get("/Login", passport.authenticate("saml", { failureRedirect: process.env.LOGIN_PAGE_URL }));
// Custom callback instead of failureRedirect: RelayState-aware redirects on success and failure
router.post("/SAML2/POST", (req, res, next) => {
  passport.authenticate("saml", (err: any, user: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return loginFailureRedirect(req, res);
    }
    // a custom callback requires an explicit logIn
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return loginRedirect(req, res);
    });
  })(req, res, next);
});

// Logout routes
router.get("/SLO/Redirect", idpInitiatedLogout);
router.get("/Logout", ensureAuthenticated, spInitiatedLogout);

export { router as authSaml };