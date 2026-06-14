// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Requires a valid JWT (from httpOnly cookie `token` or Authorization
 * header). Attaches { id, username, email } to req.user.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

/**
 * Optional auth: if a valid token is present, attaches req.user;
 * otherwise continues with req.user = null. Used for routes that
 * behave differently for logged-in vs guest users (e.g. PC builder
 * saves) without requiring login.
 */
function optionalAuth(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (_) {
    req.user = null;
  }
  next();
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

module.exports = { requireAuth, optionalAuth, signToken, JWT_SECRET };
