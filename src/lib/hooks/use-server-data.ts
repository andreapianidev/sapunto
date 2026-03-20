'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to fetch data from server actions.
 * Provides a loading state and caches the result.
 */
export function useServerData<T>(
  fetcher: () => Promise<T>,
  initialValue: T
): [T, boolean] {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetcher().then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  return [data, loading];
}
