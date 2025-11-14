import { Strategy as LocalStrategy } from "passport-local";
import validator from "validator";
import { USERS } from "../shared/constants/users";
import { User } from "../database/mongo";
import { encrypt } from "../shared/utils/crypto";
import { BadRequestError } from "../shared/error";

// Dummy user database
const users = USERS;

// Passport local strategy configuration
export const localStrategy = new LocalStrategy(
  async (username, password, done) => {
    const name = validator.isAlphanumeric(username, "de-DE", { ignore: "." })
      ? username
      : undefined;
    const pw = validator.isAscii(password) ? password : undefined;

    // check validity of request
    if (name && pw) {
      const user = users.find((u) => u.username === name && u.password === pw);
      if (!user) {
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      }
      // check if user exists in database and if not, create it
      let dbUser = await User.findOne().byShibId(user.shibId).exec();
      const roles = user.roles;
      if (!dbUser) {
        const shibId = user.shibId;
        dbUser = {
          shibId: shibId,
          roles: roles,
          authType: "local",
        };
      } else {
        // check if roles changed
        if (roles.toString().length != dbUser.roles.toString().length) {
          dbUser = await User.findByIdAndUpdate(dbUser._id, {
            $set: {
              roles: roles,
            },
          });
        }
      }
      return done(null, { user: dbUser, baId: encrypt("test") });
    } else {
      return done(new BadRequestError());
    }
  }
);
