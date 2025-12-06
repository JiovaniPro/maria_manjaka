/**
 * Système de verrous pour éviter les appels API multiples
 * Compatible avec React Strict Mode
 */

type LockEntry = {
  promise: Promise<any>;
  timestamp: number;
  count: number;
};

class RequestLockManager {
  private locks: Map<string, LockEntry> = new Map();
  private readonly LOCK_TIMEOUT = 30000; // 30 secondes

  /**
   * Vérifie si une requête est déjà en cours pour cette clé
   */
  isLocked(key: string): boolean {
    const lock = this.locks.get(key);
    if (!lock) return false;

    // Nettoyer les verrous expirés
    if (Date.now() - lock.timestamp > this.LOCK_TIMEOUT) {
      this.locks.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Obtient le verrou existant ou crée un nouveau
   */
  getLock<T>(key: string, promiseFactory: () => Promise<T>): Promise<T> {
    const existing = this.locks.get(key);
    if (existing) {
      existing.count++;
      return existing.promise;
    }

    const promise = promiseFactory()
      .finally(() => {
        // Nettoyer le verrou après résolution
        setTimeout(() => {
          const lock = this.locks.get(key);
          if (lock) {
            lock.count--;
            if (lock.count <= 0) {
              this.locks.delete(key);
            }
          }
        }, 100);
      });

    this.locks.set(key, {
      promise,
      timestamp: Date.now(),
      count: 1,
    });

    return promise;
  }

  /**
   * Libère un verrou manuellement
   */
  release(key: string): void {
    this.locks.delete(key);
  }

  /**
   * Nettoie tous les verrous expirés
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, lock] of this.locks.entries()) {
      if (now - lock.timestamp > this.LOCK_TIMEOUT) {
        this.locks.delete(key);
      }
    }
  }

  /**
   * Vide tous les verrous
   */
  clear(): void {
    this.locks.clear();
  }
}

export const requestLockManager = new RequestLockManager();

// Nettoyage automatique
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestLockManager.cleanup();
  }, 60000); // Toutes les minutes
}

