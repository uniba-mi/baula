import passport from "passport";
import { User } from '../database/mongo';
import { samlStrategy } from './passport-saml.config';
import { localStrategy } from './passport-local.config';

/** ------------------------------
 *  ---- Initialize passport -----
 *  -----------------------------*/
passport.use(samlStrategy);
passport.use(localStrategy);

passport.serializeUser((profile: any, done) => {
  done(null, { baId: profile.baId, shibId: profile.user.shibId, roles: profile.user.roles, authType: profile.user.authType });
});

passport.deserializeUser(async (ids: { baId: string, shibId: string, roles: string[], authType: string }, done) => {
  // try to find user in static user table
  let user = await User.findOne().byShibId(ids.shibId).exec();
  if(!user && ids.baId && ids.shibId) {
    // set user to minimal user
    user = {
      shibId: ids.shibId,
      roles: ids.roles,
      authType: ids.authType
    }
  }
  done(null, user);
});

export default passport;