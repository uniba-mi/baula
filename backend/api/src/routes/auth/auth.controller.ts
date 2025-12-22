import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "@node-saml/passport-saml/lib/types";
import { samlStrategy } from "../../config/passport-saml.config";
import passport from "passport";

// Local login
export function localLogin(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send("Login failed");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).send(user);
    });
  })(req, res, next);
};

export function loginRedirect(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).send({ success: false, message: "Login failed" });
  }
  return res.redirect(process.env.DASHBOARD_URL ?? 'back');
}

/**---------------------------------------------
 * --------------- Logout Routes ---------------
 ** ---------------------------------------------*/
// SP-initiated Logout
export function spInitiatedLogout(req: Request, res: Response) {
  let user: any = req.user;

  if (!req.user || !process.env.SAML_LOGOUT_ISSUER) {
    return res.json({ success: false });
  }
  const samlReq: RequestWithUser = Object.assign({}, req, {
    samlLogoutRequest: {
      issuer: process.env.SAML_LOGOUT_ISSUER,
      nameID: user.shibId,
      nameIDFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
    },
    user: {
      ...user,
      nameID: user.shibId,
      nameIDFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
    },
  });
  // logout on sp
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to logout" });
    }

    // samlStrategy.logout triggers the logout on idp and generates and sends logoutRequest to idp
    samlStrategy.logout(samlReq, (err, requestUrl) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).send("Could not log out");
      }
      if (!requestUrl) {
        // return true to show client that local logout worked
        res.json({ success: true });
      } else {
        // return status to client and redirect from there -> direct redirect is not working
        res.json({ success: true, requestUrl });
      }
    });
  });
}

// IdP-initiated Logout and redirect from idp
export function idpInitiatedLogout(req: Request, res: Response) {
  // in all cases the local session should be killed
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to logout" });
    }
    // read saml request
    samlStrategy._saml
      ?.validateRedirectAsync(req.query, req.originalUrl.split("?")[1])
      .then((value) => {
        // value is needed to check, if profile is set (idp initiated logout) or not (sp initiated logout)
        if (value.profile !== null) {
          // idp initiated logout
          const relayState =
            (req.query && req.query.RelayState) ||
            (req.body && req.body.RelayState);
          samlStrategy._saml?.getLogoutResponseUrl(
            value.profile,
            relayState,
            {},
            true,
            (err, url) => {
              if (err) {
                return res
                  .status(500)
                  .json({ success: false, message: "Failed to logout" });
              }
              if (url) {
                // pass logout response to idp
                res.redirect(url);
              } else {
                return res
                  .status(500)
                  .json({ success: false, message: "Failed to logout" });
              }
            }
          );
        } else {
          // redirect from idp, only send back success
          res.sendStatus(200);
        }
      });
  });
}

// local logout
export function localLogout(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to logout" });
    }
    res.json({ success: true });
  });
};