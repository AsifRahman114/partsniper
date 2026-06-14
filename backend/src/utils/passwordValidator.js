// utils/passwordValidator.js
// ------------------------------------------------------------
// Enforces a "strong password" policy:
//  - Minimum 8 characters (12+ recommended, but 8 is the floor)
//  - At least one uppercase, one lowercase, one digit, one symbol
//  - Not in a small list of extremely common passwords
//  - Rejects passwords containing the username or email local-part
// ------------------------------------------------------------

const COMMON_PASSWORDS = new Set([
  'password', 'password123', '12345678', '123456789', 'qwerty123',
  'letmein123', 'admin1234', 'welcome123', 'iloveyou1', 'abc123456',
  'football1', 'monkey123', 'dragon123', '1q2w3e4r', 'passw0rd',
]);

const MIN_LENGTH = 8;

/**
 * @param {string} password
 * @param {{username?: string, email?: string}} context - used to reject
 *        passwords that trivially contain the user's own identifiers
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePassword(password, context = {}) {
  const errors = [];

  if (typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common; please choose a stronger one');
  }
  if (context.username && password.toLowerCase().includes(context.username.toLowerCase())) {
    errors.push('Password must not contain your username');
  }
  if (context.email) {
    const localPart = context.email.split('@')[0].toLowerCase();
    if (localPart.length >= 3 && password.toLowerCase().includes(localPart)) {
      errors.push('Password must not contain parts of your email');
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validatePassword, MIN_LENGTH };
