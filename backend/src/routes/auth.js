// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { validateEmail } = require('../utils/emailValidator');
const { validatePassword } = require('../utils/passwordValidator');
const { signToken, requireAuth } = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/emailService');

const router = express.Router();
const BCRYPT_ROUNDS = 12;

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    emailVerified: !!row.email_verified,
    createdAt: row.created_at,
  };
}

// ----------------------------------------------------------------
// POST /api/auth/signup
// ----------------------------------------------------------------
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' });
    }

    // --- Username checks ---
    if (!USERNAME_REGEX.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-20 characters: letters, numbers, and underscores only',
      });
    }
    const existingUsername = db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUsername.rowCount > 0) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    // --- Email checks (format + domain MX/A records, i.e. "exists virtually") ---
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.reason });
    }
    const existingEmail = db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingEmail.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // --- Password strength ---
    const pwCheck = validatePassword(password, { username, email });
    if (!pwCheck.valid) {
      return res.status(400).json({ error: 'Password does not meet requirements', details: pwCheck.errors });
    }

    // --- Create user (unverified) ---
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const id = uuidv4();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.query(
      `INSERT INTO users (id, username, email, password_hash, email_verified, verification_token, verification_expires)
       VALUES ($1, $2, $3, $4, 0, $5, $6)`,
      [id, username, email.toLowerCase(), passwordHash, verificationToken, verificationExpires]
    );

    // Send verification email (proves mailbox is real & accessible)
    await sendVerificationEmail(email, username, verificationToken);

    const { rows } = db.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = publicUser(rows[0]);

    const token = signToken({ id: user.id, username: user.username, email: user.email });
    res.cookie('token', token, COOKIE_OPTS);

    res.status(201).json({
      user,
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------------------
// GET /api/auth/verify-email?token=...
// ----------------------------------------------------------------
router.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const { rows } = db.query('SELECT * FROM users WHERE verification_token = $1', [token]);
  if (rows.length === 0) {
    return res.status(400).json({ error: 'Invalid or already-used verification token' });
  }
  const user = rows[0];
  if (new Date(user.verification_expires) < new Date()) {
    return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
  }

  db.query(
    `UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires = NULL,
     updated_at = datetime('now') WHERE id = $1`,
    [user.id]
  );

  res.json({ message: 'Email verified successfully!' });
});

// ----------------------------------------------------------------
// POST /api/auth/resend-verification  (auth required)
// ----------------------------------------------------------------
router.post('/resend-verification', requireAuth, async (req, res) => {
  const { rows } = db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.email_verified) return res.json({ message: 'Email is already verified' });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.query('UPDATE users SET verification_token = $1, verification_expires = $2 WHERE id = $3', [
    verificationToken,
    verificationExpires,
    user.id,
  ]);
  await sendVerificationEmail(user.email, user.username, verificationToken);
  res.json({ message: 'Verification email resent' });
});

// ----------------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username OR email
    if (!identifier || !password) {
      return res.status(400).json({ error: 'identifier (username or email) and password are required' });
    }

    const { rows } = db.query('SELECT * FROM users WHERE username = $1 OR email = $1', [identifier.toLowerCase()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, username: user.username, email: user.email });
    res.cookie('token', token, COOKIE_OPTS);

    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------------------
// POST /api/auth/logout
// ----------------------------------------------------------------
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.json({ message: 'Logged out' });
});

// ----------------------------------------------------------------
// GET /api/auth/me  (auth required) - get current user
// ----------------------------------------------------------------
router.get('/me', requireAuth, (req, res) => {
  const { rows } = db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(rows[0]) });
});

// ----------------------------------------------------------------
// PATCH /api/auth/username  (auth required) - change username
// ----------------------------------------------------------------
router.patch('/username', requireAuth, (req, res) => {
  const { newUsername, currentPassword } = req.body;
  if (!newUsername || !currentPassword) {
    return res.status(400).json({ error: 'newUsername and currentPassword are required' });
  }
  if (!USERNAME_REGEX.test(newUsername)) {
    return res.status(400).json({ error: 'Username must be 3-20 characters: letters, numbers, underscores' });
  }

  const { rows } = db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = rows[0];

  return bcrypt.compare(currentPassword, user.password_hash).then((match) => {
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

    const dupe = db.query('SELECT id FROM users WHERE username = $1 AND id != $2', [newUsername, user.id]);
    if (dupe.rowCount > 0) return res.status(409).json({ error: 'Username is already taken' });

    db.query(`UPDATE users SET username = $1, updated_at = datetime('now') WHERE id = $2`, [newUsername, user.id]);

    // Issue a new token reflecting the updated username
    const token = signToken({ id: user.id, username: newUsername, email: user.email });
    res.cookie('token', token, COOKIE_OPTS);

    res.json({ message: 'Username updated', username: newUsername });
  });
});

// ----------------------------------------------------------------
// PATCH /api/auth/password  (auth required) - change password
// ----------------------------------------------------------------
router.patch('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    const { rows } = db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = rows[0];

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

    const pwCheck = validatePassword(newPassword, { username: user.username, email: user.email });
    if (!pwCheck.valid) {
      return res.status(400).json({ error: 'Password does not meet requirements', details: pwCheck.errors });
    }
    if (await bcrypt.compare(newPassword, user.password_hash)) {
      return res.status(400).json({ error: 'New password must be different from the current password' });
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    db.query(`UPDATE users SET password_hash = $1, updated_at = datetime('now') WHERE id = $2`, [newHash, user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
