'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Scale } from 'lucide-react';
import { useCompare } from '@/lib/compare-context';

export default function CompareBar() {
  const { items, remove, clear, max } = useCompare();

  if (items.length === 0) return null;

  const ids = items.map((i) => i.id).join(',');
  const canCompare = items.length >= 2;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-lime/30 bg-surface/95 backdrop-blur-sm shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium shrink-0">
          <Scale className="w-4 h-4 text-lime" />
          Compare ({items.length}/{max})
        </div>

        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {items.map((item) => (
            <div key={item.id} className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-surface2 border border-border group">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" unoptimized />
              )}
              <button
                onClick={() => remove(item.id)}
                className="absolute inset-0 bg-bg/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                aria-label={`Remove ${item.name}`}
              >
                <X className="w-4 h-4 text-danger" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clear} className="text-sm text-muted hover:text-text px-3 py-2 transition-colors">
            Clear
          </button>
          <Link
            href={canCompare ? `/compare?ids=${ids}` : '#'}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              canCompare
                ? 'bg-lime text-bg hover:bg-limeDark'
                : 'bg-surface2 text-muted cursor-not-allowed pointer-events-none'
            }`}
          >
            Compare {canCompare ? '' : '(min 2)'}
          </Link>
        </div>
      </div>
    </div>
  );
}
