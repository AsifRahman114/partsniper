'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Heart, Scale, Clock, ArrowLeft, Loader2, Store, ShoppingCart } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCompare } from '@/lib/compare-context';
import { formatBDT, formatTimeRemaining } from '@/lib/format';
import StarRating from '@/components/StarRating';
import ShopRatingWidget from '@/components/ShopRatingWidget';
import SpecsTable from '@/components/SpecsTable';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toggle, isSelected } = useCompare();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then((d) => {
        setData(d);
        setSaved(d.product.isSaved);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-muted"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...</div>;
  }
  if (error || !data) {
    return <div className="text-center py-24 text-danger">{error || 'Product not found'}</div>;
  }

  const { product, otherShops } = data;
  const hasDiscount = product.originalPrice && product.discountPct;
  const timeRemaining = formatTimeRemaining(product.offerEndsAt);
  const allListings = [product, ...otherShops].sort((a, b) => a.currentPrice - b.currentPrice);
  const lowestPrice = allListings[0]?.currentPrice;

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const { saved: nowSaved } = await api.post(`/products/${id}/save`);
      setSaved(nowSaved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="relative aspect-square bg-surface border border-border rounded-2xl overflow-hidden">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">No image</div>
          )}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-success text-bg text-sm font-bold font-mono px-3 py-1.5 rounded-lg">
              -{Math.round(product.discountPct)}% OFF
            </div>
          )}
          {!product.inStock && (
            <div className="absolute top-3 right-3 bg-bg/90 border border-border text-muted text-sm font-medium px-3 py-1.5 rounded-lg">
              Out of Stock
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted font-mono">{product.category?.name}{product.brand ? ` • ${product.brand}` : ''}</p>
            <h1 className="font-display text-2xl font-bold mt-1">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-mono font-bold text-3xl">{formatBDT(product.currentPrice)}</span>
              {hasDiscount && (
                <span className="font-mono text-lg text-muted line-through">{formatBDT(product.originalPrice)}</span>
              )}
            </div>
            {timeRemaining && (
              <div className="flex items-center gap-1.5 text-sm text-success">
                <Clock className="w-4 h-4" /> {timeRemaining}
              </div>
            )}
            {allListings.length > 1 && product.currentPrice === lowestPrice && (
              <div className="text-xs text-lime font-medium">🎯 Lowest price across {allListings.length} shops</div>
            )}

            {/* Shop */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-muted" />
                <span className="font-medium">{product.shop?.name}</span>
              </div>
            </div>
            <ShopRatingWidget shop={product.shop} />

            {/* Buy button */}
            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center justify-center gap-2 w-full bg-lime text-bg font-semibold rounded-lg py-3 hover:bg-limeDark transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy at {product.shop?.name}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Secondary actions */}
            <div className="flex gap-2">
              {user && (
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-border rounded-lg py-2 text-sm hover:border-lime/40 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-lime text-lime' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </button>
              )}
              <button
                onClick={() => toggle({ id: product.id, name: product.name, imageUrl: product.imageUrl })}
                className={`flex-1 flex items-center justify-center gap-1.5 border rounded-lg py-2 text-sm transition-colors ${
                  isSelected(product.id) ? 'border-lime text-lime' : 'border-border hover:border-lime/40'
                }`}
              >
                <Scale className="w-4 h-4" />
                {isSelected(product.id) ? 'Added to Compare' : 'Add to Compare'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="font-display font-semibold text-lg mb-3">Specifications</h2>
        <SpecsTable specs={product.specs} />
      </div>

      {/* Other shops */}
      {otherShops.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-display font-semibold text-lg mb-3">Compare prices across shops</h2>
          <div className="space-y-2">
            {allListings.map((listing) => (
              <a
                key={listing.id}
                href={listing.id === product.id ? undefined : `/product/${listing.id}`}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                  listing.id === product.id
                    ? 'border-lime/40 bg-lime/5'
                    : 'border-border hover:border-lime/30 bg-bg/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-sm font-medium">{listing.shop.name}</p>
                    <StarRating value={listing.shop.avgRating || 0} count={listing.shop.ratingCount} size={10} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">{formatBDT(listing.currentPrice)}</p>
                  {listing.currentPrice === lowestPrice && (
                    <p className="text-xs text-lime">Best price</p>
                  )}
                  {!listing.inStock && <p className="text-xs text-muted">Out of stock</p>}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
