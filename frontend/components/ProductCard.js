'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock, Store, Scale, Check } from 'lucide-react';
import { useState } from 'react';
import StarRating from './StarRating';
import { formatBDT, formatTimeRemaining } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';
import { useCompare } from '@/lib/compare-context';
import { api } from '@/lib/api';

export default function ProductCard({ product, onSaveToggle }) {
  const { user } = useAuth();
  const { toggle, isSelected } = useCompare();
  const [saved, setSaved] = useState(product.isSaved);
  const [saving, setSaving] = useState(false);
  const selected = isSelected(product.id);

  const hasDiscount = product.originalPrice && product.discountPct;
  const timeRemaining = formatTimeRemaining(product.offerEndsAt);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || saving) return;
    setSaving(true);
    try {
      const { saved: nowSaved } = await api.post(`/products/${product.id}/save`);
      setSaved(nowSaved);
      onSaveToggle?.(product.id, nowSaved);
    } catch (_) {
      // silently ignore - non-critical
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className={`reticle group block bg-surface border rounded-xl overflow-hidden
                 hover:border-lime/40 transition-colors duration-200 relative
                 ${selected ? 'border-lime ring-1 ring-lime/30' : 'border-border'}`}
    >
      <span className="reticle-tr" />
      <span className="reticle-bl" />

      {/* Image */}
      <div className="relative aspect-square bg-surface2">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-xs">No image</div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-success text-ink text-xs font-bold font-mono px-2 py-1 rounded-md">
            -{Math.round(product.discountPct)}%
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-ink/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-muted border border-border rounded px-2 py-1 bg-ink/80">
              Out of Stock
            </span>
          </div>
        )}

        {/* Action buttons: compare-select + save */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product);
            }}
            className={`p-1.5 rounded-full transition-colors ${
              selected ? 'bg-lime text-ink' : 'bg-ink/70 text-muted hover:text-text'
            }`}
            aria-label="Select for comparison"
            title="Add to comparison"
          >
            {selected ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
          </button>
          {user && (
            <button
              onClick={handleSave}
              className="p-1.5 rounded-full bg-ink/70 hover:bg-ink transition-colors"
              aria-label="Save product"
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-lime text-lime' : 'text-muted'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-medium leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-lime transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-mono font-bold text-lg text-text">{formatBDT(product.currentPrice)}</span>
          {hasDiscount && (
            <span className="font-mono text-xs text-muted line-through">{formatBDT(product.originalPrice)}</span>
          )}
        </div>

        {/* Offer countdown */}
        {timeRemaining && (
          <div className="flex items-center gap-1 text-xs text-success">
            <Clock className="w-3 h-3" />
            {timeRemaining}
          </div>
        )}

        {/* Shop info */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted min-w-0">
            <Store className="w-3 h-3 shrink-0" />
            <span className="truncate">{product.shop?.name}</span>
          </div>
          <StarRating value={product.shop?.avgRating || 0} count={product.shop?.ratingCount} size={11} />
        </div>
      </div>
    </Link>
  );
}
