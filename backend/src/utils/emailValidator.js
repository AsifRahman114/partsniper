// utils/emailValidator.js
// ------------------------------------------------------------
// Validates that an email is well-formed AND that its domain
// has valid MX (or A/AAAA fallback) records, i.e. the domain
// is actually configured to receive mail. This catches typos
// like "user@gmial.com" or "user@nonexistentdomain123.com"
// without sending any mail yet.
//
// Final proof of a *real, accessible* mailbox is the
// verification email + link (sent on signup; account stays
// unverified, with limited access, until clicked).
// ------------------------------------------------------------

const dns = require('dns').promises;

// RFC 5322-ish practical regex (good balance of strict vs usable)
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// A small denylist of disposable/temp-mail domains. Extend as needed.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'tempmail.net', '10minutemail.com',
  'guerrillamail.com', 'yopmail.com', 'throwawaymail.com', 'fakeinbox.com',
  'trashmail.com', 'getnada.com', 'sharklasers.com', 'maildrop.cc',
]);

function isWellFormed(email) {
  if (typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

function getDomain(email) {
  return email.split('@')[1].toLowerCase();
}

function isDisposable(email) {
  return DISPOSABLE_DOMAINS.has(getDomain(email));
}

/**
 * Checks whether the email's domain has MX records (or at least
 * A/AAAA as a fallback per RFC 5321) — i.e. the domain CAN receive
 * mail. Does not guarantee the specific mailbox exists; that is
 * confirmed by the verification-link click.
 *
 * Returns { valid: boolean, reason?: string }
 */
async function domainAcceptsMail(email) {
  const domain = getDomain(email);
  try {
    const mx = await dns.resolveMx(domain);
    if (mx && mx.length > 0) return { valid: true };
  } catch (_) {
    // fall through to A/AAAA fallback
  }
  try {
    const a = await dns.resolve4(domain);
    if (a && a.length > 0) return { valid: true };
  } catch (_) {}
  try {
    const aaaa = await dns.resolve6(domain);
    if (aaaa && aaaa.length > 0) return { valid: true };
  } catch (_) {}

  return { valid: false, reason: `Domain "${domain}" does not appear to accept email (no MX/A/AAAA records found)` };
}

/**
 * Full validation pipeline used by the signup route.
 * Returns { valid: boolean, reason?: string }
 */
async function validateEmail(email) {
  if (!isWellFormed(email)) {
    return { valid: false, reason: 'Email format is invalid' };
  }
  if (isDisposable(email)) {
    return { valid: false, reason: 'Disposable/temporary email addresses are not allowed' };
  }
  const dnsCheck = await domainAcceptsMail(email);
  if (!dnsCheck.valid) {
    return dnsCheck;
  }
  return { valid: true };
}

module.exports = { validateEmail, isWellFormed, isDisposable, domainAcceptsMail };
