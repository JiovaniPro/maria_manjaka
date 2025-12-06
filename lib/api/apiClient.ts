/**
 * Client API optimisé avec :
 * - Verrous pour éviter les appels multiples
 * - Retry intelligent avec backoff exponentiel
 * - Gestion des erreurs 429 (rate limit)
 * - Timeout configurable
 * - Cache intégré
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { apiCache } from './cache';
import { requestLockManager } from './requestLock';

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 seconde
const REQUEST_TIMEOUT = 30000; // 30 secondes
const MAX_CONCURRENT_REQUESTS = 10;
const RATE_LIMIT_RETRY_DELAY = 5000; // 5 secondes pour 429

// Compteur de requêtes en cours
let activeRequests = 0;
const requestQueue: Array<() => void> = [];

/**
 * Gère la file d'attente des requêtes pour limiter la concurrence
 */
function processQueue() {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
    return;
  }

  const nextRequest = requestQueue.shift();
  if (nextRequest) {
    activeRequests++;
    nextRequest();
  }
}

/**
 * Retry avec backoff exponentiel
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY_BASE
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Ne pas retry pour certaines erreurs
    if (
      retries === 0 ||
      (error.response?.status && ![429, 500, 502, 503, 504].includes(error.response.status))
    ) {
      throw error;
    }

    // Pour les erreurs 429, attendre plus longtemps
    const retryDelay = error.response?.status === 429 
      ? RATE_LIMIT_RETRY_DELAY 
      : delay;

    await new Promise(resolve => setTimeout(resolve, retryDelay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Crée une instance Axios optimisée
 */
function createApiClient(): AxiosInstance {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercepteur de requête
  api.interceptors.request.use(
    async (config) => {
      // Ajouter le token JWT
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Gérer la file d'attente pour limiter la concurrence
      return new Promise((resolve) => {
        const executeRequest = () => {
          resolve(config);
        };

        if (activeRequests < MAX_CONCURRENT_REQUESTS) {
          activeRequests++;
          executeRequest();
        } else {
          requestQueue.push(executeRequest);
        }
      });
    },
    (error) => {
      activeRequests = Math.max(0, activeRequests - 1);
      processQueue();
      return Promise.reject(error);
    }
  );

  // Intercepteur de réponse
  api.interceptors.response.use(
    (response) => {
      activeRequests = Math.max(0, activeRequests - 1);
      processQueue();
      return response;
    },
    async (error: AxiosError) => {
      activeRequests = Math.max(0, activeRequests - 1);
      processQueue();

      // Gérer les erreurs 401 (non autorisé)
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/connexion')) {
            window.location.href = '/connexion';
          }
        }
      }

      // Gérer les erreurs 429 (rate limit)
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : RATE_LIMIT_RETRY_DELAY;
        
        // Attendre avant de retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return Promise.reject(error);
    }
  );

  return api;
}

// Instance singleton
const apiClient = createApiClient();

/**
 * Fonction wrapper pour les appels API avec cache et verrous
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig,
  options: {
    useCache?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
    skipLock?: boolean;
  } = {}
): Promise<T> {
  const {
    useCache = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes par défaut
    skipLock = false,
  } = options;

  // Générer une clé de cache si non fournie
  const key = cacheKey || `${config.method}_${config.url}_${JSON.stringify(config.params || config.data)}`;

  // Vérifier le cache pour les requêtes GET
  if (useCache && config.method === 'GET' || !config.method) {
    const cached = apiCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  // Utiliser le verrou pour éviter les appels multiples
  if (!skipLock) {
    return requestLockManager.getLock(key, async () => {
      return retryWithBackoff(async () => {
        const response = await apiClient.request<T>(config);
        const data = response.data as any;
        const result = data.data || data;

        // Mettre en cache pour les requêtes GET réussies
        if (useCache && (config.method === 'GET' || !config.method) && response.status === 200) {
          apiCache.set(key, result);
        }

        return result;
      });
    });
  }

  // Sans verrou (pour les requêtes POST/PUT/DELETE)
  return retryWithBackoff(async () => {
    const response = await apiClient.request<T>(config);
    const data = response.data as any;
    return data.data || data;
  });
}

/**
 * Méthodes HTTP simplifiées
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig, options?: Parameters<typeof apiRequest>[1]) =>
    apiRequest<T>({ ...config, method: 'GET', url }, options),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig, options?: Parameters<typeof apiRequest>[1]) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }, { ...options, useCache: false }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig, options?: Parameters<typeof apiRequest>[1]) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }, { ...options, useCache: false }),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig, options?: Parameters<typeof apiRequest>[1]) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }, { ...options, useCache: false }),

  delete: <T>(url: string, config?: AxiosRequestConfig, options?: Parameters<typeof apiRequest>[1]) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }, { ...options, useCache: false }),
};

export default api;
