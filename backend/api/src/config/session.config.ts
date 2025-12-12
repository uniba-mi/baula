import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import session from "express-session";

// configurate redis
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing");
}

// configure and export session
export const expressSession = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  name: process.env.SESSION_NAME ?? "testSession",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.COOKIE_SECURE === "true" ? true : false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000,
    sameSite: true,
  },
});
