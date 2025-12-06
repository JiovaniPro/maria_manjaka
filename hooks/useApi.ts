import { useState, useEffect, useRef, useCallback } from 'react';
import { cachedFetch } from '@/lib/api/cache';
import api from '@/services/api';

type UseApiOptions<T> = {
  key: string;
  fetchFn: () => Promise<T>;
  enabled?: boolean;
  ttl?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  refetchOnMount?: boolean;
};

type UseApiResult<T> = {
  data: T | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  invalidate: () => void;
};

/**
 * Hook optimisé pour les appels API avec cache et verrous
 * Évite les appels multiples même avec React Strict Mode
 */
export function useApi<T>({
  key,
  fetchFn,
  enabled = true,
  ttl,
  onSuccess,
  onError,
  refetchOnMount = false,
}: UseApiOptions<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await cachedFetch(key, fetchFn, ttl);
      
      if (isMounted.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        onError?.(err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [key, enabled, ttl, onSuccess, onError]);

  const refetch = useCallback(async () => {
    // Invalider le cache avant de refetch
    const { apiCache } = require('@/lib/api/cache');
    apiCache.invalidate(key);
    await fetchData();
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    const { apiCache } = require('@/lib/api/cache');
    apiCache.invalidate(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    isMounted.current = true;

    // Éviter les doubles appels en dev (React Strict Mode)
    if (hasFetched.current && !refetchOnMount) {
      return;
    }

    hasFetched.current = true;
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData, refetchOnMount]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  };
}

/**
 * Hook spécialisé pour les données qui changent rarement (comptes, catégories)
 */
export function useStaticData<T>(
  key: string,
  fetchFn: () => Promise<T>
): UseApiResult<T> {
  return useApi({
    key,
    fetchFn,
    ttl: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  });
}

/**
 * Hook pour les données qui changent souvent (transactions)
 */
export function useDynamicData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): UseApiResult<T> {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // Invalider le cache quand les dépendances changent
    const { apiCache } = require('@/lib/api/cache');
    apiCache.invalidate(key);
    setVersion(v => v + 1);
  }, dependencies);

  return useApi({
    key: `${key}_v${version}`,
    fetchFn,
    ttl: 1 * 60 * 1000, // 1 minute
    refetchOnMount: true,
  });
}

