import { useState, useEffect, useCallback } from 'react';

interface SecurityLockState {
  isLocked: boolean;
  failedAttempts: number;
  unlockAttempts: number;
  lockUntil: number | null;
  penaltyLevel: number;
}

const STORAGE_KEY = 'security_lock_state';
const MAX_FAILED_ATTEMPTS = 5; // Nombre de tentatives avant blocage initial
const MAX_UNLOCK_ATTEMPTS = 3; // Nombre de tentatives avant pénalité
const PENALTY_LEVELS = [
  { duration: 30 * 1000 },      // 30 secondes
  { duration: 5 * 60 * 1000 },  // 5 minutes
  { duration: 60 * 60 * 1000 }, // 1 heure
  { duration: 5 * 60 * 60 * 1000 }, // 5 heures
  { duration: 7 * 24 * 60 * 60 * 1000 }, // 1 semaine
];

export function useSecurityLock() {
  const [state, setState] = useState<SecurityLockState>(() => {
    if (typeof window === 'undefined') {
      return {
        isLocked: false,
        failedAttempts: 0,
        unlockAttempts: 0,
        lockUntil: null,
        penaltyLevel: 0,
      };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Vérifier si le blocage est toujours actif
      if (parsed.lockUntil && parsed.lockUntil > Date.now()) {
        return parsed;
      } else if (parsed.lockUntil && parsed.lockUntil <= Date.now()) {
        // Le blocage a expiré, réinitialiser
        localStorage.removeItem(STORAGE_KEY);
        return {
          isLocked: false,
          failedAttempts: 0,
          unlockAttempts: 0,
          lockUntil: null,
          penaltyLevel: 0,
        };
      }
      return parsed;
    }
    return {
      isLocked: false,
      failedAttempts: 0,
      unlockAttempts: 0,
      lockUntil: null,
      penaltyLevel: 0,
    };
  });

  const saveState = useCallback((newState: SecurityLockState) => {
    setState(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  }, []);

  // Vérifier périodiquement si le blocage a expiré
  useEffect(() => {
    if (state.lockUntil && state.lockUntil > Date.now()) {
      const interval = setInterval(() => {
        setState((prev) => {
          if (prev.lockUntil && prev.lockUntil <= Date.now()) {
            // Le blocage a expiré
            const resetState: SecurityLockState = {
              ...prev,
              unlockAttempts: 0, // Réinitialiser les tentatives de déverrouillage
              lockUntil: null,
            };
            saveState(resetState);
            return resetState;
          }
          return prev;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.lockUntil, saveState]);

  const recordFailedAttempt = useCallback(() => {
    setState((prev) => {
      const newFailedAttempts = prev.failedAttempts + 1;
      let newState: SecurityLockState;

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS && !prev.isLocked) {
        // Activer le blocage
        newState = {
          isLocked: true,
          failedAttempts: newFailedAttempts,
          unlockAttempts: 0,
          lockUntil: null,
          penaltyLevel: 0,
        };
      } else {
        newState = {
          ...prev,
          failedAttempts: newFailedAttempts,
        };
      }

      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const recordUnlockFailedAttempt = useCallback(() => {
    setState((prev) => {
      if (!prev.isLocked) return prev;

      const newUnlockAttempts = prev.unlockAttempts + 1;
      let newState: SecurityLockState;

      if (newUnlockAttempts >= MAX_UNLOCK_ATTEMPTS) {
        // Appliquer une pénalité
        const newPenaltyLevel = Math.min(prev.penaltyLevel + 1, PENALTY_LEVELS.length - 1);
        const penalty = PENALTY_LEVELS[newPenaltyLevel];
        const lockUntil = Date.now() + penalty.duration;

        newState = {
          ...prev,
          unlockAttempts: 0, // Réinitialiser pour le prochain cycle
          lockUntil,
          penaltyLevel: newPenaltyLevel,
        };
      } else {
        newState = {
          ...prev,
          unlockAttempts: newUnlockAttempts,
        };
      }

      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const resetFailedAttempts = useCallback(() => {
    setState((prev) => {
      const resetState: SecurityLockState = {
        ...prev,
        failedAttempts: 0,
      };
      saveState(resetState);
      return resetState;
    });
  }, [saveState]);

  const unlock = useCallback((password: string, adminPassword: string) => {
    if (password === adminPassword) {
      // Déverrouiller l'application
      const resetState: SecurityLockState = {
        isLocked: false,
        failedAttempts: 0,
        unlockAttempts: 0,
        lockUntil: null,
        penaltyLevel: 0,
      };
      saveState(resetState);
      return true;
    } else {
      recordUnlockFailedAttempt();
      return false;
    }
  }, [saveState, recordUnlockFailedAttempt]);

  // État pour forcer le re-render pendant le compte à rebours
  const [currentRemainingTime, setCurrentRemainingTime] = useState(() => {
    if (!state.lockUntil || state.lockUntil <= Date.now()) {
      return 0;
    }
    return Math.ceil((state.lockUntil - Date.now()) / 1000);
  });

  // Mettre à jour le temps restant toutes les secondes
  useEffect(() => {
    if (state.lockUntil && state.lockUntil > Date.now()) {
      const updateTime = () => {
        const remaining = Math.ceil((state.lockUntil! - Date.now()) / 1000);
        setCurrentRemainingTime(Math.max(0, remaining));
      };

      updateTime(); // Mise à jour immédiate
      const interval = setInterval(updateTime, 1000);

      return () => clearInterval(interval);
    } else {
      setCurrentRemainingTime(0);
    }
  }, [state.lockUntil]);

  const getRemainingTime = useCallback(() => {
    return currentRemainingTime;
  }, [currentRemainingTime]);

  const canAttemptUnlock = useCallback(() => {
    if (!state.isLocked) return true;
    if (!state.lockUntil) return true;
    return state.lockUntil <= Date.now();
  }, [state.isLocked, state.lockUntil]);

  const remainingAttempts = MAX_FAILED_ATTEMPTS - state.failedAttempts;

  return {
    isLocked: state.isLocked,
    failedAttempts: state.failedAttempts,
    remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0,
    unlockAttempts: state.unlockAttempts,
    penaltyLevel: state.penaltyLevel,
    remainingTime: getRemainingTime(),
    canAttemptUnlock: canAttemptUnlock(),
    recordFailedAttempt,
    recordUnlockFailedAttempt,
    resetFailedAttempts,
    unlock,
  };
}

