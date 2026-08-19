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
  name: process.env.SESSION_NAME ?? "baulaSession",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Always true in production
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    sameSite: 'lax', // or 'strict' for higher security
    domain: process.env.COOKIE_DOMAIN, // Optional: for subdomains
  },
});
