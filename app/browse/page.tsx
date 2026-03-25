'use client';
// app/browse/page.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useFundraisers } from '@/hooks/useFundraisers';
import FundraiserCard from '@/components/fundraiser/FundraiserCard';
import CategoryFilter from '@/components/ui/CategoryFilter';
import EmptyState from '@/components/ui/EmptyState';

const SORTS = [
  { value: 'recent',   label: 'Most Recent' },
  { value: 'trending', label: 'Trending' },
  { value: 'urgent',   label: 'Most Urgent' },
  { value: 'ending',   label: 'Ending Soon' },
];

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort]         = useState('recent');
  const [search, setSearch]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { fundraisers, loading, hasMore, loadMore } = useFundraisers({
    category,
    sort,
    search: debouncedSearch,
  });

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'all') params.delete('category');
    else params.set('category', val);
    router.replace(`/browse?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Browse Fundraisers</h1>
        <p style={{ color: 'var(--color-muted)' }}>Find a cause to support or start your own</p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
          <input
            className="input pl-9"
            placeholder="Search fundraisers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
          <select
            className="input pl-9 pr-4 appearance-none cursor-pointer w-full sm:w-44"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="mb-8">
        <CategoryFilter selected={category} onChange={handleCategoryChange} />
      </div>

      {/* Results */}
      {loading && fundraisers.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card h-80 animate-pulse" style={{ background: '#f5efe6' }} />
          ))}
        </div>
      ) : fundraisers.length === 0 ? (
        <EmptyState
          title="No fundraisers found"
          description={search ? `No results for "${search}". Try a different search.` : 'No active fundraisers in this category yet.'}
        />
      ) : (
        <>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
            Showing {fundraisers.length} fundraiser{fundraisers.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundraisers.map((f, i) => (
              <FundraiserCard
                key={f._id}
                fundraiser={f}
                className="opacity-0-init animate-fade-up"
                style={{ animationDelay: `${(i % 6) * 80}ms`, animationFillMode: 'forwards' }}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-10">
              <button className="btn-secondary px-8" onClick={loadMore} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
