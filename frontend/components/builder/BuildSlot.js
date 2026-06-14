'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Lock, Unlock, X, ExternalLink } from 'lucide-react';
import { formatBDT } from '@/lib/format';

export default function BuildSlot({ label, product, locked, onPick, onRemove, onToggleLock, required }) {
  if (!product) {
    return (
      <button
        onClick={onPick}
        className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-colors text-left w-full
          ${required ? 'border-border hover:border-lime/40' : 'border-border/60 hover:border-lime/30'}`}
      >
        <div className="w-12 h-12 rounded-lg bg-surface2 flex items-center justify-center shrink-0">
          <Plus className="w-5 h-5 text-muted" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="text-xs text-muted/70">{required ? 'Required — click to add' : 'Optional — click to add'}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface relative group">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface2 shrink-0">
        {product.imageUrl && (
          <Image src={product.imageUrl} alt={product.name} fill sizes="48px" className="object-cover" unoptimized />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted uppercase tracking-wide font-mono">{label}</p>
        <Link href={`/product/${product.id}`} target="_blank" className="text-sm font-medium truncate block hover:text-lime transition-colors">
          {product.name}
        </Link>
        <p className="text-xs text-muted">{product.shop?.name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono font-semibold text-sm">{formatBDT(product.currentPrice)}</p>
        <div className="flex items-center gap-1.5 justify-end mt-1">
          <button
            onClick={onToggleLock}
            className={`p-1 rounded transition-colors ${locked ? 'text-lime' : 'text-muted hover:text-text'}`}
            title={locked ? 'Locked — won\'t change on re-optimize' : 'Lock this part'}
          >
            {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onPick} className="p-1 text-muted hover:text-text transition-colors" title="Change">
            <Plus className="w-3.5 h-3.5 rotate-45" />
          </button>
          {!required && (
            <button onClick={onRemove} className="p-1 text-muted hover:text-danger transition-colors" title="Remove">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
