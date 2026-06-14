'use client';

// lib/compare-context.js
// ------------------------------------------------------------
// Tracks product ids the user has selected for the Compare page.
// State lives in React context at the root layout, so it persists
// across client-side navigation (selecting on the dashboard, then
// clicking through to /compare). Max 6 items (matches the
// backend's /api/compare limit).
// ------------------------------------------------------------

import { createContext, useContext, useState, useCallback } from 'react';

const CompareContext = createContext(null);
const MAX_COMPARE = 6;

export function CompareProvider({ children }) {
  // Map of productId -> minimal product info (id, name, imageUrl) for display in the bar
  const [items, setItems] = useState([]);

  const toggle = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= MAX_COMPARE) return prev; // silently ignore beyond max
      return [...prev, { id: product.id, name: product.name, imageUrl: product.imageUrl }];
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const isSelected = useCallback((id) => items.some((p) => p.id === id), [items]);

  return (
    <CompareContext.Provider value={{ items, toggle, remove, clear, isSelected, max: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
