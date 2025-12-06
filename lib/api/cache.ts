/**
 * Système de cache API avec verrous pour éviter les appels multiples
 * Compatible avec React Strict Mode et Next.js 16
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
};

type RequestLock = {
  promise: Promise<any>;
  timestamp: number;
};

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private locks: Map<string, RequestLock> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes par défaut

  /**
   * Récupère une valeur du cache si elle existe et n'est pas expirée
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.DEFAULT_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Met une valeur en cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Vérifie si une requête est en cours (verrou)
   */
  hasLock(key: string): boolean {
    const lock = this.locks.get(key);
    if (!lock) return false;

    // Nettoyer les verrous anciens (> 30 secondes)
    if (Date.now() - lock.timestamp > 30000) {
      this.locks.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Obtient le verrou existant ou crée un nouveau
   */
  getOrCreateLock<T>(key: string, promiseFactory: () => Promise<T>): Promise<T> {
    const existingLock = this.locks.get(key);
    if (existingLock) {
      return existingLock.promise;
    }

    const promise = promiseFactory().finally(() => {
      // Nettoyer le verrou après résolution
      setTimeout(() => {
        this.locks.delete(key);
      }, 100);
    });

    this.locks.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Invalide le cache pour une clé spécifique
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalide toutes les entrées correspondant à un pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Nettoie le cache (supprime les entrées expirées)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.DEFAULT_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
    this.locks.clear();
  }
}

// Instance singleton
export const apiCache = new ApiCache();

// Nettoyage automatique toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * Fonction helper pour faire un appel API avec cache et verrou
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Vérifier le cache d'abord
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Utiliser le verrou pour éviter les appels multiples
  return apiCache.getOrCreateLock(key, async () => {
    try {
      const data = await fetchFn();
      apiCache.set(key, data);
      return data;
    } catch (error) {
      // En cas d'erreur, ne pas mettre en cache
      throw error;
    }
  });
}

