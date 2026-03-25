// hooks/useFundraisers.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Fundraiser } from '@/types';

interface FiltersType {
  category?: string;
  sort?: string;
  search?: string;
  urgent?: boolean;
}

export function useFundraisers(filters: FiltersType = {}) {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchFundraisers = useCallback(async (pageNum = 1, replace = true) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '12',
        ...(filters.category && filters.category !== 'all' ? { category: filters.category } : {}),
        ...(filters.sort ? { sort: filters.sort } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.urgent ? { urgent: 'true' } : {}),
      });

      const res = await fetch(`/api/fundraisers?${params}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error);

      setFundraisers(prev => replace ? json.data : [...prev, ...json.data]);
      setHasMore(json.hasMore);
      setPage(pageNum);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.sort, filters.search, filters.urgent]);

  useEffect(() => {
    fetchFundraisers(1, true);
  }, [fetchFundraisers]);

  const loadMore = () => fetchFundraisers(page + 1, false);
  const refresh  = () => fetchFundraisers(1, true);

  return { fundraisers, loading, error, hasMore, loadMore, refresh };
}

export function useFundraiser(idOrSlug: string) {
  const [fundraiser, setFundraiser] = useState<(Fundraiser & { donations: unknown[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);
    fetch(`/api/fundraisers/${idOrSlug}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setFundraiser(json.data);
        else setError(json.error);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  return { fundraiser, loading, error, setFundraiser };
}
