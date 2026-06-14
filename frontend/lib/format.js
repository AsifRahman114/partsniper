// lib/format.js

/**
 * Formats a number as BDT currency: "৳ 38,500"
 */
export function formatBDT(amount) {
  if (amount == null) return '—';
  return `৳ ${Number(amount).toLocaleString('en-US')}`;
}

/**
 * Returns a human-friendly "ends in Xd Yh" string for an ISO date,
 * or null if the date is missing/past.
 */
export function formatTimeRemaining(isoDate) {
  if (!isoDate) return null;
  const end = new Date(isoDate);
  const now = new Date();
  const diffMs = end - now;
  if (diffMs <= 0) return null;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `Ends in ${days}d ${hours}h`;
  if (hours > 0) return `Ends in ${hours}h`;
  return 'Ends soon';
}

/**
 * Slugifies a category/shop name for display fallbacks.
 */
export function titleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}
