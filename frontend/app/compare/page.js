'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, X, ExternalLink, Trophy, Tag, Scale } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatBDT } from '@/lib/format';
import StarRating from '@/components/StarRating';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = (searchParams.get('ids') || '').split(',').filter(Boolean);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.get(`/compare?ids=${ids.join(',')}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load comparison'))
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);

  const removeItem = (id) => {
    const remaining = ids.filter((i) => i !== id);
    if (remaining.length < 2) {
      router.push('/');
    } else {
      router.push(`/compare?ids=${remaining.join(',')}`);
    }
  };

  if (ids.length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Scale className="w-12 h-12 text-muted mx-auto" />
        <h1 className="font-display text-2xl font-bold">Nothing to compare yet</h1>
        <p className="text-muted">
          Head back to the dashboard and select at least 2 products using the
          <span className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded bg-surface border border-border text-xs">
            <Scale className="w-3 h-3" /> compare
          </span>
          button on each product card.
        </p>
        <Link href="/" className="inline-block bg-lime text-bg font-semibold rounded-lg px-5 py-2.5 hover:bg-limeDark transition-colors">
          Browse parts
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-muted"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading comparison...</div>;
  }
  if (error) {
    return <div className="text-center py-24 text-danger">{error}</div>;
  }

  const { products, performance, category } = data;
  const maxPrice = Math.max(...products.map((p) => p.currentPrice));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Scale className="w-6 h-6 text-lime" /> Compare
        </h1>
        {!category && (
          <p className="text-sm text-muted mt-1">
            These products span different categories — only price comparison is shown below.
          </p>
        )}
      </div>

      {/* Product cards row */}
      <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(products.length, 4)}`}>
        {products.map((product) => (
          <div key={product.id} className="bg-surface border border-border rounded-2xl p-4 space-y-3 relative">
            <button
              onClick={() => removeItem(product.id)}
              className="absolute top-3 right-3 p-1 rounded-full bg-bg/70 hover:bg-bg text-muted hover:text-danger transition-colors z-10"
              aria-label="Remove from comparison"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-square bg-surface2 rounded-lg overflow-hidden">
              {product.imageUrl && (
                <Image src={product.imageUrl} alt={product.name} fill sizes="300px" className="object-cover" unoptimized />
              )}
              {product.isCheapest && (
                <span className="absolute top-2 left-2 bg-success text-bg text-xs font-bold px-2 py-1 rounded-md">Cheapest</span>
              )}
              {product.isBestValue && (
                <span className="absolute bottom-2 left-2 bg-lime text-bg text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Best Value
                </span>
              )}
            </div>

            <Link href={`/product/${product.id}`} className="block">
              <p className="text-xs uppercase tracking-wide text-muted font-mono">{product.brand}</p>
              <h3 className="text-sm font-medium leading-snug line-clamp-2 hover:text-lime transition-colors min-h-[2.5rem]">{product.name}</h3>
            </Link>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-xl">{formatBDT(product.currentPrice)}</span>
                {product.originalPrice && (
                  <span className="font-mono text-xs text-muted line-through">{formatBDT(product.originalPrice)}</span>
                )}
              </div>
              <div className="scope-bar-track">
                <div className="scope-bar-fill" style={{ width: `${(product.currentPrice / maxPrice) * 100}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{product.shop.name}</span>
              <StarRating value={product.shop.avgRating || 0} count={product.shop.ratingCount} size={10} />
            </div>

            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center justify-center gap-1.5 w-full border border-border rounded-lg py-2 text-sm hover:border-lime/40 hover:text-lime transition-colors"
            >
              View Deal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Performance comparison */}
      {performance && performance.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-5">
          <h2 className="font-display font-semibold text-lg">Performance</h2>
          {performance.map((field) => {
            const validValues = field.values.map((v) => v.value).filter((v) => v != null);
            const maxVal = validValues.length ? Math.max(...validValues) : 0;
            return (
              <div key={field.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{field.label}</span>
                  {!field.higherIsBetter && <span className="text-xs text-muted italic">lower is better</span>}
                </div>
                <div className="space-y-1.5">
                  {field.values.map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-muted w-32 truncate shrink-0">{products[i].brand} {products[i].model || ''}</span>
                      <div className="scope-bar-track flex-1">
                        <div
                          className="scope-bar-fill"
                          style={{
                            width: v.value != null ? `${maxVal ? (v.value / maxVal) * 100 : 0}%` : '0%',
                            background: v.isBest ? undefined : '#3a4150',
                          }}
                        />
                      </div>
                      <span className={`text-xs font-mono w-20 text-right shrink-0 ${v.isBest ? 'text-lime font-bold' : 'text-muted'}`}>
                        {v.value != null ? v.value.toLocaleString() : '—'}
                        {v.isBest && ' ★'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add more */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-lime transition-colors">
          <Tag className="w-4 h-4" /> Browse more parts to add to comparison
        </Link>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-lime" /></div>}>
      <CompareContent />
    </Suspense>
  );
}
