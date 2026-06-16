'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Loader2, Search, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { formatBDT } from '@/lib/format';

/**
 * Modal listing all in-stock products for a category, sorted by
 * price (toggleable), with client-side text filter. Clicking a
 * product calls onSelect(product) and the parent closes the modal.
 */
export default function ComponentPicker({ categorySlug, label, onSelect, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('price_asc');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/builder/components?category=${categorySlug}&sort=${sort}`)
      .then((d) => setProducts(d.products))
      .finally(() => setLoading(false));
  }, [categorySlug, sort]);

  const filtered = products.filter((p) =>
    !query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg">Select {label}</h2>
          <button onClick={onClose} className="p-1 text-muted hover:text-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full bg-bg border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-lime/50"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime/50"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted py-12 text-sm">No products found.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface2 transition-colors text-left"
                >
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-surface2 shrink-0">
                    {product.imageUrl && (
                      <Image src={product.imageUrl} alt={product.name} fill sizes="48px" className="object-cover" unoptimized />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Store className="w-3 h-3" /> {product.shop?.name}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-sm shrink-0">{formatBDT(product.currentPrice)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
