'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import StarRating from './StarRating';

/**
 * Shows a shop's average rating, and if the user is logged in, lets
 * them submit/update their own 1-5 rating via POST /api/shops/:id/rate.
 */
export default function ShopRatingWidget({ shop }) {
  const { user } = useAuth();
  const [avgRating, setAvgRating] = useState(shop.avgRating || 0);
  const [ratingCount, setRatingCount] = useState(shop.ratingCount || 0);
  const [myRating, setMyRating] = useState(shop.myRating || 0);
  const [submitting, setSubmitting] = useState(false);
  const [justRated, setJustRated] = useState(false);

  const handleRate = async (rating) => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const data = await api.post(`/shops/${shop.id}/rate`, { rating });
      setAvgRating(data.avgRating);
      setRatingCount(data.ratingCount);
      setMyRating(data.myRating);
      setJustRated(true);
    } catch (_) {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StarRating value={avgRating} count={ratingCount} size={16} />
        <span className="text-xs text-muted">customer service rating</span>
      </div>

      {user ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{myRating ? 'Your rating:' : 'Rate this shop:'}</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => handleRate(i)} disabled={submitting} aria-label={`Rate ${i} stars`}>
                <Star
                  size={16}
                  className={`transition-colors ${
                    i <= myRating ? 'fill-lime text-lime' : 'fill-transparent text-muted hover:text-lime'
                  }`}
                />
              </button>
            ))}
          </div>
          {submitting && <Loader2 className="w-3 h-3 animate-spin text-muted" />}
          {justRated && !submitting && <span className="text-xs text-success">Thanks!</span>}
        </div>
      ) : (
        <p className="text-xs text-muted">Log in to rate this shop's service quality.</p>
      )}
    </div>
  );
}
