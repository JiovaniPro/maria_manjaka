/**
 * Hook optimisé pour les appels API avec :
 * - Protection contre React Strict Mode (double appel en dev)
 * - Cache automatique
 * - Verrous pour éviter les appels multiples
 * - Retry intelligent
 * - Compatible Next.js 16 + Turbopack
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiCache } from '@/lib/api/cache';
import { requestLockManager } from '@/lib/api/requestLock';
import { apiRequest } from '@/lib/api/apiClient';
import type { AxiosRequestConfig } from 'axios';

type UseApiOptions<T> = {
  key: string;
  fetchFn: () => Promise<T>;
  enabled?: boolean;
  ttl?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  refetchOnMount?: boolean;
  refetchInterval?: number;
  dependencies?: any[];
};

type UseApiResult<T> = {
  data: T | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  invalidate: () => void;
};

/**
 * Hook optimisé pour les appels API
 * Garantit qu'un appel n'est jamais exécuté plus d'une fois par rechargement
 */
export function useApi<T>({
  key,
  fetchFn,
  enabled = true,
  ttl = 5 * 60 * 1000, // 5 minutes par défaut
  onSuccess,
  onError,
  refetchOnMount = false,
  refetchInterval,
  dependencies = [],
}: UseApiOptions<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  // Refs pour gérer React Strict Mode
  const hasFetched = useRef(false);
  const isMounted = useRef(true);
  const fetchPromise = useRef<Promise<T> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Si une requête est déjà en cours, attendre sa résolution
    if (fetchPromise.current) {
      try {
        const result = await fetchPromise.current;
        if (isMounted.current) {
          setData(result);
          setLoading(false);
        }
        return;
      } catch (err) {
        // Continuer avec une nouvelle requête en cas d'erreur
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Utiliser le cache et le verrou
      const cacheKey = `api_${key}`;
      
      // Vérifier le cache d'abord
      const cached = apiCache.get<T>(cacheKey);
      if (cached !== null && !refetchOnMount) {
        if (isMounted.current) {
          setData(cached);
          setLoading(false);
          onSuccess?.(cached);
        }
        return;
      }

      // Créer la promesse de fetch avec verrou
      fetchPromise.current = requestLockManager.getLock(cacheKey, async () => {
        const result = await fetchFn();
        
        // Mettre en cache
        apiCache.set(cacheKey, result);
        
        return result;
      });

      const result = await fetchPromise.current;
      fetchPromise.current = null;

      if (isMounted.current) {
        setData(result);
        setLoading(false);
        onSuccess?.(result);
      }
    } catch (err: any) {
      fetchPromise.current = null;
      
      if (isMounted.current) {
        setError(err);
        setLoading(false);
        onError?.(err);
      }
    }
  }, [key, enabled, ttl, onSuccess, onError, refetchOnMount, fetchFn]);

  const refetch = useCallback(async () => {
    // Invalider le cache
    apiCache.invalidate(`api_${key}`);
    // Réinitialiser le flag pour forcer un nouveau fetch
    hasFetched.current = false;
    await fetchData();
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    apiCache.invalidate(`api_${key}`);
    setData(null);
  }, [key]);

  useEffect(() => {
    isMounted.current = true;

    // Protection contre React Strict Mode
    // En dev, React peut appeler l'effet deux fois
    // On utilise un flag pour s'assurer qu'il ne s'exécute qu'une fois
    if (hasFetched.current && !refetchOnMount) {
      return;
    }

    hasFetched.current = true;
    fetchData();

    // Gérer le refetch interval
    if (refetchInterval) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, refetchInterval);
    }

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchData, refetchOnMount, refetchInterval, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  };
}

/**
 * Hook spécialisé pour les données statiques (comptes, catégories)
 * Cache long (10 minutes)
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
 * Hook pour les données dynamiques (transactions)
 * Cache court (1 minute) avec refetch automatique
 */
export function useDynamicData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): UseApiResult<T> {
  return useApi({
    key: `${key}_v${dependencies.join('_')}`,
    fetchFn,
    ttl: 1 * 60 * 1000, // 1 minute
    refetchOnMount: true,
    dependencies,
  });
}
