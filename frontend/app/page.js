'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Crosshair, Loader2, SearchX } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryNav from '@/components/CategoryNav';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import { api } from '@/lib/api';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = searchParams.get('category') || null;
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const discountsOnly = searchParams.get('discountsOnly') === 'true';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load categories once
  useEffect(() => {
    api.get('/categories').then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  // Build query string and fetch products whenever filters change
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (discountsOnly) params.set('discountsOnly', 'true');
    if (inStockOnly) params.set('inStockOnly', 'true');
    params.set('page', String(page));
    params.set('limit', '24');

    api.get(`/products?${params.toString()}`)
      .then((d) => {
        setProducts(d.products);
        setPagination(d.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, search, sort, discountsOnly, inStockOnly, page]);

  const updateParams = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    // Reset to page 1 whenever filters (not page itself) change
    if (!('page' in updates)) params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const handleSaveToggle = (productId, saved) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, isSaved: saved } : p)));
  };

  const activeCategory = categories.find((c) => c.slug === category);
  const showHero = !category && !search && !discountsOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hero */}
      {showHero && (
        <div className="grid-bg relative rounded-2xl border border-border overflow-hidden">
          <div className="relative px-6 py-10 sm:px-10 sm:py-14 bg-gradient-to-br from-bg via-bg/95 to-surface/60">
            <div className="flex items-center gap-3 mb-3">
              <Crosshair className="w-8 h-8 text-lime" strokeWidth={2.5} />
              <span className="text-xs font-mono uppercase tracking-widest text-lime">Target acquired</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold max-w-2xl leading-tight">
              Snipe the best price on PC parts across Bangladesh's top tech shops.
            </h1>
            <p className="text-muted mt-3 max-w-xl text-sm sm:text-base">
              Live prices from Star Tech, Ryans, Techland, UCC, Potaka IT, and more —
              compared, ranked, and ready to buy.
            </p>
          </div>
        </div>
      )}

      {/* Page heading for filtered views */}
      {(category || search || discountsOnly) && (
        <div>
          <h1 className="font-display text-2xl font-bold">
            {search ? `Search: "${search}"` : discountsOnly ? 'Discounts & Sales' : activeCategory?.name || 'Products'}
          </h1>
        </div>
      )}

      {/* Category nav */}
      <CategoryNav categories={categories} active={category} onSelect={(slug) => updateParams({ category: slug })} />

      {/* Filter bar */}
      <FilterBar
        sort={sort}
        onSortChange={(v) => updateParams({ sort: v })}
        discountsOnly={discountsOnly}
        onDiscountsToggle={() => updateParams({ discountsOnly: !discountsOnly })}
        inStockOnly={inStockOnly}
        onInStockToggle={() => updateParams({ inStockOnly: !inStockOnly })}
        resultCount={pagination.total}
      />

      {/* Product grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading parts...
        </div>
      ) : error ? (
        <div className="text-center py-24 text-danger">{error}</div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted gap-2">
          <SearchX className="w-10 h-10" />
          <p>No products found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onSaveToggle={handleSaveToggle} />
            ))}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={(p) => updateParams({ page: p })} />
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-muted"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
