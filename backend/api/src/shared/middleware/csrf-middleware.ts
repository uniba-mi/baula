import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Token Management Middleware
 * Generates and validates CSRF tokens for POST, PUT, DELETE, PATCH requests
 * Uses the double-submit cookie pattern
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';

/**
 * Generate a new CSRF token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Middleware to generate CSRF token for GET requests
 * The token is stored in a cookie and should be included in subsequent requests
 */
export function generateCsrfTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Only generate token if it doesn't exist
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      // Must be readable by client-side JS for the double-submit pattern to
      // work: Angular's HttpClient reads this cookie by default and mirrors
      // it into the X-XSRF-TOKEN header on outgoing requests automatically.
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });
  }
  next();
}

/**
 * Middleware to validate CSRF token for state-changing requests
 * Validates that the X-XSRF-TOKEN header matches the cookie value
 */
export function validateCsrfTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip validation for API docs, login (no session/cookie
  // exists yet - protected by rate limiting instead) and the SAML ACS
  // (verified via the signed SAML assertion, not a browser session cookie)
  if (
    req.path.startsWith('/api/docs') ||
    req.path.startsWith('/login') ||
    req.path.startsWith('/Shibboleth.sso')
  ) {
    return next();
  }

  // Get token from header and cookie
  const headerToken = req.get(CSRF_HEADER_NAME);
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];

  // Allow requests without CSRF validation in local development
  // (for easier testing with tools like Postman)
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Validate tokens match
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      error: {
        message: 'Invalid CSRF token',
        code: 'INVALID_CSRF_TOKEN',
      },
    });
  }

  next();
}

/**
 * Combined middleware that generates token for GET and validates for other methods
 */
export function csrfProtectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return generateCsrfTokenMiddleware(req, res, next);
  }
  return validateCsrfTokenMiddleware(req, res, next);
}
