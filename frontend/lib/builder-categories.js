// lib/builder-categories.js
// ------------------------------------------------------------
// Mirrors backend CATEGORY_TO_BUILD_KEY (services/buildOptimizer.js)
// plus display metadata. Order here determines slot display order.
// HDD is included as an optional manual-only slot (the optimizer
// doesn't auto-allocate it, since SSD covers the primary-drive role
// in BUDGET_WEIGHTS, but users can add one manually for bulk storage).
// ------------------------------------------------------------

export const BUILDER_CATEGORIES = [
  { slug: 'cpu', buildKey: 'CPU', label: 'CPU', required: true },
  { slug: 'gpu', buildKey: 'GPU', label: 'Graphics Card', required: true },
  { slug: 'motherboard', buildKey: 'Motherboard', label: 'Motherboard', required: true },
  { slug: 'ram', buildKey: 'RAM', label: 'RAM', required: true },
  { slug: 'ssd', buildKey: 'SSD', label: 'SSD', required: true },
  { slug: 'hdd', buildKey: 'HDD', label: 'HDD (optional)', required: false },
  { slug: 'psu', buildKey: 'PSU', label: 'Power Supply', required: true },
  { slug: 'casing', buildKey: 'Casing', label: 'Casing', required: true },
  { slug: 'cooler', buildKey: 'Cooler', label: 'CPU Cooler', required: false },
  { slug: 'monitor', buildKey: 'Monitor', label: 'Monitor', required: false },
];

export const BUILD_KEY_TO_SLUG = Object.fromEntries(BUILDER_CATEGORIES.map((c) => [c.buildKey, c.slug]));
