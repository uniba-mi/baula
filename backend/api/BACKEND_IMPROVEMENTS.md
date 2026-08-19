# Backend Improvements - Branch `backend-improvements`

This branch contains comprehensive improvements to the Baula backend API. All changes are **non-breaking** and maintain backwards compatibility.

## 📋 Summary of Changes

### ✅ Security Enhancements

1. **CORS Configuration**
   - Fixed CORS to work in production (previously only enabled in local environment)
   - Added support for multiple allowed origins via `ALLOWED_ORIGINS` environment variable
   - Configurable CORS headers (methods, headers, credentials)

2. **Rate Limiting**
   - Added `express-rate-limit` to prevent brute force and DDoS attacks
   - Default: 100 requests per 15 minutes per IP
   - Skip rate limiting for Swagger docs and health checks
   - Custom error responses with proper logging

3. **Cookie Security**
   - Enhanced session cookie configuration in `session.config.ts`
   - Secure flag automatically set to `true` in production
   - SameSite='lax' for CSRF protection
   - Configurable cookie domain

4. **CSRF Protection**
   - Added CSRF middleware using double-submit cookie pattern
   - Token generation for GET requests
   - Token validation for POST/PUT/DELETE/PATCH requests
   - Only enforced in production (skipped in development for easier testing)
   - Uses `cookie-parser` for cookie access

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
   - Returns status of MongoDB and Redis connections
   - Includes timestamp, uptime, and environment info
   - Returns 200 (healthy) or 503 (degraded) status codes

### ✅ API Design

1. **API Versioning**
   - Added v1 prefix to all routes (`/api/v1/baula`, `/api/v1/bilapp`, etc.)
   - Backwards compatibility: old routes still work but are deprecated
   - Deprecation warnings logged to console

2. **Input Validation**
   - Added Zod validation schemas for common request types
   - Validation middleware for body, query, and params
   - Detailed error messages for validation failures
   - Type-safe request data

3. **Error Handling**
   - Enhanced error handler middleware
   - Consistent error format in responses
   - Proper status codes (400, 401, 403, 404, 500)

### ✅ Testing

1. **Jest Configuration**
   - Full Jest test setup with TypeScript support
   - MongoDB Memory Server for isolated tests
   - Test utilities and mocks
   - Coverage reporting (text, lcov, html)

2. **Example Tests**
   - Health endpoint tests
   - Validation middleware tests
   - CORS header tests
   - Authentication tests

### ✅ Code Quality

1. **ESLint Configuration**
   - TypeScript-ESLint parser
   - Strict type checking rules
   - Prettier integration for formatting
   - Custom rules for code consistency

2. **Prettier Configuration**
   - Consistent code formatting
   - 100 character line width
   - 2-space indentation
   - Semi-colons enabled

3. **Environment Validation**
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
- `eslint` ^9.14.0 - Linting
- `@typescript-eslint/parser` ^8.12.2 - TypeScript ESLint parser
- `@typescript-eslint/eslint-plugin` ^8.12.2 - TypeScript ESLint plugin
- `eslint-config-prettier` ^9.1.0 - Prettier ESLint config
- `prettier` ^3.3.3 - Code formatting
- `jest` ^29.7.0 - Testing framework
- `ts-jest` ^29.2.5 - TypeScript Jest support
- `supertest` ^7.0.0 - HTTP assertions
- `@types/jest` ^29.5.12 - Jest type definitions
- `@types/supertest` ^6.0.2 - Supertest type definitions
- `@types/compression` ^1.7.5 - Compression type definitions
- `@types/cookie-parser` ^1.4.7 - Cookie parser type definitions
- `mongodb-memory-server` ^10.0.0 - In-memory MongoDB for tests

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

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Run Linting**
   ```bash
   npm run lint
   ```

5. **Format Code**
   ```bash
   npm run format
   ```

### New Scripts Available

```bash
npm run test           # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
npm run format        # Format all code with Prettier
npm run check-format  # Check formatting without applying
```

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
- Tests and linting are opt-in (not enforced in CI yet)

## 🎯 Next Steps (Optional)

1. **Add to CI/CD**
   - Add `npm run lint` to your CI pipeline
   - Add `npm test` for automated testing

2. **Enforce Testing**
   - Add test coverage requirements
   - Set up pre-commit hooks with Husky

3. **Add More Validations**
   - Add Zod schemas for your specific route handlers
   - Replace existing manual validation with Zod

4. **Enable CSRF in Production**
   - Configure your frontend to include CSRF tokens
   - Test thoroughly before enabling in production

## 📞 Support

For questions or issues with these changes, please refer to:
- The [Express Rate Limit documentation](https://www.npmjs.com/package/express-rate-limit)
- The [Zod documentation](https://zod.dev/)
- The [Jest documentation](https://jestjs.io/)
- The [ESLint documentation](https://eslint.org/)

## 📄 Files Changed

### New Files
- `backend/api/.eslintrc.json` - ESLint configuration
- `backend/api/.prettierrc` - Prettier configuration
- `backend/api/.gitignore` - Git ignore for backend
- `backend/api/jest.config.js` - Jest configuration
- `backend/api/src/__tests__/` - Test files
- `backend/api/src/shared/middleware/validation-middleware.ts` - Validation middleware
- `backend/api/src/shared/middleware/csrf-middleware.ts` - CSRF middleware
- `backend/api/src/shared/validation/` - Validation schemas
- `backend/api/src/shared/utils/test-setup.ts` - Test setup utilities
- `backend/api/environment/.env.backend.example` - Example configuration

### Modified Files
- `backend/api/package.json` - New dependencies and scripts
- `backend/api/src/app.ts` - CORS, rate limiting, compression, cookie-parser
- `backend/api/src/server.ts` - Graceful shutdown
- `backend/api/src/config/session.config.ts` - Enhanced cookie security
- `backend/api/src/config/env.config.ts` - Environment validation
- `backend/api/src/database/mongo.ts` - Connection pooling
- `backend/api/src/routes/api.router.ts` - Health check, API versioning
- `backend/api/tsconfig.json` - TypeScript configuration updates

---

**Commit Hash:** [To be filled after merge]
**Branch:** `backend-improvements`
**Status:** Ready for review ✅
