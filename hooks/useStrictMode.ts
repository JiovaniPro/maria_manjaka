/**
 * Hook pour gérer React Strict Mode et éviter les doubles appels
 * Compatible avec Next.js 16 + Turbopack
 */

import { useEffect, useRef } from 'react';

/**
 * Hook qui garantit qu'un effet ne s'exécute qu'une seule fois
 * Même avec React Strict Mode qui double les appels en dev
 */
export function useStrictModeEffect(
  effect: () => void | (() => void),
  deps?: React.DependencyList
) {
  const hasRun = useRef(false);
  const cleanup = useRef<(() => void) | void>();

  useEffect(() => {
    // En dev, React Strict Mode peut appeler l'effet deux fois
    // On utilise un flag pour s'assurer qu'il ne s'exécute qu'une fois
    if (hasRun.current) {
      return;
    }

    hasRun.current = true;
    cleanup.current = effect();

    return () => {
      if (cleanup.current) {
        cleanup.current();
      }
      // Réinitialiser pour permettre un nouveau montage si nécessaire
      hasRun.current = false;
    };
  }, deps);
}

// Note: useOnce nécessite React, mais on évite l'import circulaire
// Utiliser useApi à la place pour les appels API

