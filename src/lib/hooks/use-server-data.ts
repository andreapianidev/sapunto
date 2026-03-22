'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to fetch data from server actions.
 * Provides a loading state and supports manual refresh.
 */
export function useServerData<T>(
  fetcher: () => Promise<T>,
  initialValue: T
): [T, boolean, () => void] {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const doFetch = useCallback(() => {
    fetcherRef.current().then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    doFetch();
  }, [doFetch]);

  const refresh = useCallback(() => {
    setLoading(true);
    doFetch();
  }, [doFetch]);

  return [data, loading, refresh];
}
