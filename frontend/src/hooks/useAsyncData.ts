import { useState, useEffect, DependencyList } from 'react';
import { logger } from '@/core/logger';

interface UseAsyncDataOptions<T> {
  /**
   * Async function that fetches the data
   */
  fetchFn: () => Promise<T>;
  /**
   * Dependencies array (like useEffect dependencies)
   */
  deps?: DependencyList;
  /**
   * Error message prefix for logging
   */
  errorMessage?: string;
  /**
   * Whether to fetch immediately on mount (default: true)
   */
  immediate?: boolean;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to handle async data loading with loading and error states
 * Eliminates boilerplate try/catch/finally and loading state management
 *
 * @example
 * const { data, loading, error } = useAsyncData({
 *   fetchFn: () => catalogService.getProducts(),
 *   errorMessage: 'Failed to load products'
 * });
 */
export function useAsyncData<T>({
  fetchFn,
  deps = [],
  errorMessage = 'Failed to load data',
  immediate = true,
}: UseAsyncDataOptions<T>): UseAsyncDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error(errorMessage, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    loading,
    error,
    refetch: loadData,
  };
}
