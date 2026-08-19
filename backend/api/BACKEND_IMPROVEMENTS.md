# Backend Improvements - Branch `backend-improvements`

This branch contains comprehensive improvements to the Baula backend API. All changes are **non-breaking** and maintain backwards compatibility.

> **Review update (2026-08-19):** The initial draft of this branch had a
> critical unrelated bug and several features that were documented as done
> but not actually wired up or working. All of the following were found and
> fixed:
> - `interfaces/semester.ts` had an accidental leftover debug date
>   (`new Date(2027, 5, 4, ...)` instead of `new Date()`) affecting all
>   semester detection app-wide - reverted.
> - CSRF protection middleware existed but was never mounted in `app.ts` -
>   now wired in.
> - CORS fell back to `origin: '*'` with `credentials: true`, which browsers
>   reject outright - fixed to fall back to `ORIGIN` instead.
> - Login (`/login/local`) had no endpoint-specific rate limit beyond the
>   generic limiter - added a dedicated 5 req/15min limiter.
>
> **Follow-up (2026-08-19, same day):** the app sits behind an Apache
> reverse proxy in production
> (`server/apache2/sites-available/000-default.conf.template`), but `app.ts`
> never called `app.set('trust proxy', ...)`. Without it, Express reads
> every request's IP as the proxy's IP, so **all users share a single
> rate-limit bucket** instead of getting one each - the generic limiter's
> 15-minute window then meant one active user (or a few) could lock out
> everyone else behind the proxy for up to 15 minutes. Fixed: `trust proxy`
> set to `1` (trust exactly the one known Apache hop), and the generic
> limiter's window shortened from 15 minutes to 1 minute (with `max` raised
> from 100 to 300) so a burst - e.g. a dashboard load firing many parallel
> requests - recovers within a minute instead of locking a client out for a
> quarter hour. `/login/local`'s 5 req/15min limiter is unaffected (it's
> deliberately strict; it protects against credential brute-forcing, not
> normal usage volume).
>
> **Follow-up (2026-08-19, later same day):** Jest (testing) and
> ESLint/Prettier (linting/formatting) were removed from this branch again
> at the user's request - not wanted for this project. All test files,
> `jest.config.js`, `eslint.config.js`, `.prettierrc`, and the related
> `devDependencies` are gone; `package-lock.json` and `node_modules` were
> regenerated accordingly. This document has been updated to no longer
> reference either.

## 📋 Summary of Changes

### ✅ Security Enhancements

1. **CORS Configuration**
   - Fixed CORS to work in production (previously only enabled in local environment)
   - Added support for multiple allowed origins via `ALLOWED_ORIGINS` environment variable
   - Falls back to the existing single-value `ORIGIN` var if `ALLOWED_ORIGINS`
     isn't set, and to an empty allow-list (not `'*'`) if neither is set -
     `credentials: true` combined with a wildcard origin is invalid per the
     CORS spec and gets rejected by browsers outright, so it must never be
     the fallback
   - Configurable CORS headers (methods, headers, credentials)

2. **Rate Limiting**
   - Added `express-rate-limit` to prevent brute force and DDoS attacks
   - `app.set('trust proxy', 1)` so limits key on the real client IP behind
     the Apache reverse proxy, not the proxy's own IP (see the follow-up
     note above)
   - Default: 300 requests per 1 minute per IP (skips Swagger docs and
     health checks) - short window with a generous cap so normal SPA usage
     (parallel requests on page load) doesn't get throttled, while still
     recovering quickly instead of locking a client out for a long window
   - Dedicated stricter limiter on `POST /login/local`: 5 attempts per 15
     minutes per IP, since that endpoint is the actual brute-force target
   - Custom error responses with proper logging

3. **Cookie Security**
   - Enhanced session cookie configuration in `session.config.ts`
   - Secure flag automatically set to `true` in production
   - SameSite='lax' for CSRF protection
   - Configurable cookie domain

4. **CSRF Protection**
   - Double-submit cookie pattern, mounted globally in `app.ts` (after
     `cookie-parser`, before routes)
   - `GET`/`HEAD`/`OPTIONS` requests receive a non-httpOnly `XSRF-TOKEN`
     cookie (must be JS-readable for the double-submit pattern to work -
     Angular's `HttpClient` reads this cookie and mirrors it into the
     `X-XSRF-TOKEN` header automatically by default, no frontend changes
     needed as long as the cookie/header names stay `XSRF-TOKEN`/
     `X-XSRF-TOKEN`)
   - `POST`/`PUT`/`DELETE`/`PATCH` requests are validated against it
   - Exempted: `/api/docs`, `/api/health`, `/login/*` (no session/cookie
     exists yet - protected by the login rate limiter instead), and
     `/Shibboleth.sso/*` (verified via the signed SAML assertion, not a
     session cookie)
   - Only enforced in production (skipped in development for easier
     testing)

5. **Helmet Security Headers**
   - Enhanced Content Security Policy (CSP)
   - Added HSTS with preload
   - Frameguard to prevent clickjacking
   - XSS filter enabled

### ✅ Performance Improvements

1. **MongoDB Connection Pooling**
   - Added connection pooling with configurable pool size (default: 10)
   - Retry logic for failed writes and reads
   - Timeout configurations for better error handling
   - Application name for monitoring

2. **Response Compression**
   - Added `compression` middleware for gzip encoding
   - Reduces response size for faster transfers

3. **Enhanced Logging**
   - Custom morgan format with response time
   - Integration with Winston logger
   - Includes user agent and remote address

### ✅ DevOps & Monitoring

1. **Graceful Shutdown**
   - Handle SIGTERM (Docker/Kubernetes) and SIGINT (Ctrl+C)
   - Properly close MongoDB and Redis connections
   - Prevent data corruption during shutdown
   - Handle unhandled rejections and exceptions

2. **Health Check Endpoint**
   - New `/api/health` endpoint
   - Returns status of MongoDB (`mongoose.connection.readyState`) and Redis
     (`redisClient.isReady` - the `redis` package's actual property; an
     earlier draft checked a non-existent `.status` field, which failed to
     compile)
   - Includes timestamp, uptime, and environment info
   - Returns 200 (healthy) or 503 (degraded) status codes

### ✅ API Design

1. **API Versioning**
   - Added v1 prefix to all routes (`/api/v1/baula`, `/api/v1/bilapp`, etc.)
   - Backwards compatibility: old routes still work but are deprecated
   - Deprecation warnings logged to console

2. **Input Validation (infrastructure only - not yet applied to routes)**
   - Added Zod validation schemas for common request shapes
     (`shared/validation/schemas.ts`) and middleware for body/query/params
     (`shared/middleware/validation-middleware.ts`)
   - **Not yet wired into any actual route.** The existing controllers were
     built and manually validated before this branch existed, and several
     use body shapes that don't match the drafted schemas 1:1 (e.g.
     `updateModuleFeedback` expects `{ feedback: {...} }`, while
     `moduleFeedbackSchema` validates the flat inner object) - wiring this
     up route-by-route needs a dedicated pass per controller, not a
     blanket `app.use()`. Treat this as reusable scaffolding for future
     routes, not a completed migration.

3. **Error Handling**
   - Enhanced error handler middleware
   - Consistent error format in responses
   - Proper status codes (400, 401, 403, 404, 500)

4. **Environment Validation**
   - Required environment variables are validated on startup
   - Clear error messages for missing variables
   - Example configuration file provided

## 📦 New Dependencies

### Production Dependencies
- `express-rate-limit` ^7.4.1 - Rate limiting middleware
- `compression` ^1.7.4 - Response compression
- `cookie-parser` ^1.4.6 - Cookie parsing
- `zod` ^3.23.8 - Schema validation

### Development Dependencies
- `@types/compression` ^1.7.5 - Compression type definitions
- `@types/cookie-parser` ^1.4.7 - Cookie parser type definitions

### Updated Dependencies
- `mongoose` ^8.19.2 → ^8.20.0

## 🚀 Usage

### Before Merging

1. **Install Dependencies**
   ```bash
   cd backend/api
   npm install
   ```

2. **Update Environment Variables**
   - Add `ALLOWED_ORIGINS` to your `.env.backend` file
   - Example: `ALLOWED_ORIGINS=http://localhost:4200,https://baula-test.minf.uni-bamberg.de`

## 📝 Migration Guide

### For Developers

1. **CORS Configuration**
   - Replace any hardcoded CORS settings with the new `ALLOWED_ORIGINS` environment variable

2. **Rate Limiting**
   - If you need different rate limits for specific routes, you can add custom rate limiters

3. **CSRF Protection**
   - For production: Ensure your frontend includes the `X-XSRF-TOKEN` header
   - For development: CSRF is automatically disabled

4. **API Versioning**
   - Use `/api/v1/...` for all new development
   - Existing `/api/...` routes will continue to work but are deprecated

### For Frontend Integration

1. **CSRF Token**
   - The backend now sets a `XSRF-TOKEN` cookie and header
   - Your frontend should read this token and include it in the `X-XSRF-TOKEN` header for POST/PUT/DELETE requests

2. **Health Checks**
   - You can monitor the API health at `/api/health`
   - Returns JSON with service statuses

## 🔄 Backwards Compatibility

All changes maintain **100% backwards compatibility**:

- Old routes continue to work (with deprecation warnings)
- Existing environment variables are still supported
- No breaking changes to API contracts

## 🎯 Next Steps (Optional)

1. **Wire Up Zod Validation**
   - The schemas and middleware exist (`shared/validation/`) but aren't
     applied to any route yet - go through controllers one at a time,
     adjust each schema to the real body/query/param shape, and add
     `validateBody(...)`/`validateQuery(...)`/`validateParams(...)` to
     that route

2. **Enable CSRF in Production**
   - Configure your frontend to include CSRF tokens
   - Test thoroughly before enabling in production

## 📞 Support

For questions or issues with these changes, please refer to:
- The [Express Rate Limit documentation](https://www.npmjs.com/package/express-rate-limit)
- The [Zod documentation](https://zod.dev/)

## 📄 Files Changed

### New Files
- `backend/api/.gitignore` - Git ignore for backend
- `backend/api/src/shared/middleware/validation-middleware.ts` - Validation middleware
- `backend/api/src/shared/middleware/csrf-middleware.ts` - CSRF middleware
- `backend/api/src/shared/validation/` - Validation schemas
- `backend/api/environment/.env.backend.example` - Example configuration

### Modified Files
- `backend/api/package.json` - New dependencies
- `backend/api/src/app.ts` - CORS, rate limiting (global + login-specific),
  compression, cookie-parser, CSRF middleware mounted, `trust proxy`
- `backend/api/src/server.ts` - Graceful shutdown
- `backend/api/src/config/session.config.ts` - Enhanced cookie security
- `backend/api/src/config/env.config.ts` - Environment validation
- `backend/api/src/database/mongo.ts` - Connection pooling
- `backend/api/src/routes/api.router.ts` - Health check (fixed to use
  `redisClient.isReady`), API versioning
- `backend/api/tsconfig.json` - TypeScript configuration updates
- `interfaces/semester.ts` - reverted an accidental leftover debug date
  that had replaced `new Date()` in all four semester-detection methods

---

**Commit Hash:** [To be filled after merge]
**Branch:** `backend-improvements`
**Status:** Reviewed and corrected 2026-08-19 - `npm run build` verified
passing. No test suite or linter is part of this branch (removed at the
user's request). Zod route validation is still infrastructure-only (see
"Input Validation" above); everything else in this document is implemented
and wired up.
