"use client";

import React, { useState, useEffect } from "react";
import { useSecurityLock } from "@/hooks/useSecurityLock";
import { useAdminPassword } from "@/hooks/useAdminPassword";
import { LockIcon } from "./Icons";

interface SecurityLockModalProps {
  onUnlock?: () => void;
}

export function SecurityLockModal({ onUnlock }: SecurityLockModalProps) {
  const { adminPassword } = useAdminPassword();
  const {
    isLocked,
    unlockAttempts,
    penaltyLevel,
    remainingTime,
    canAttemptUnlock,
    unlock,
  } = useSecurityLock();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [displayTime, setDisplayTime] = useState(remainingTime);

  useEffect(() => {
    if (!isLocked) {
      setPassword("");
      setError("");
      setDisplayTime(0);
      if (onUnlock) {
        onUnlock();
      }
    }
  }, [isLocked, onUnlock]);

  // Synchroniser le temps d'affichage avec le hook et le mettre à jour toutes les secondes
  useEffect(() => {
    setDisplayTime(remainingTime);
  }, [remainingTime]);

  // Mettre à jour le compte à rebours toutes les secondes
  useEffect(() => {
    if (displayTime > 0) {
      const timer = setInterval(() => {
        setDisplayTime((prev) => {
          if (prev <= 0) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [displayTime]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    } else {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}j ${hours}h`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canAttemptUnlock) {
      setError(`Veuillez attendre ${formatTime(displayTime)} avant de réessayer.`);
      return;
    }

    if (unlock(password, adminPassword)) {
      setPassword("");
      setError("");
    } else {
      setError("Mot de passe incorrect.");
      setPassword("");
    }
  };

  if (!isLocked) {
    return null;
  }

  const penaltyMessages = [
    "30 secondes",
    "5 minutes",
    "1 heure",
    "5 heures",
    "1 semaine",
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md rounded-3xl border-2 border-red-500/50 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 rounded-full bg-red-100 p-4">
            <LockIcon />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Application Bloquée
          </h2>
          <p className="text-center text-sm text-black/60">
            Trop de tentatives échouées. L'application est temporairement
            verrouillée pour des raisons de sécurité.
          </p>
        </div>

        {!canAttemptUnlock && displayTime > 0 && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-center text-sm font-semibold text-red-700 mb-2">
              ⏱️ Temps d'attente restant
            </p>
            <p className="text-center text-3xl font-bold text-red-600 animate-pulse">
              {formatTime(displayTime)}
            </p>
            {penaltyLevel > 0 && (
              <p className="text-center text-xs text-red-600 mt-2">
                Niveau de pénalité: {penaltyLevel + 1}/5
              </p>
            )}
          </div>
        )}

        {canAttemptUnlock && (
          <>
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">
                ⚠️ Avertissement Important
              </p>
              <p className="text-xs text-amber-700">
                Si vous tentez encore de forcer l'accès avec des mots de passe
                incorrects, l'application sera définitivement fermée. Contactez
                l'administrateur principal si vous avez oublié le mot de passe.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-black">
                  Mot de passe administrateur
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  disabled={!canAttemptUnlock}
                  className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-60"
                  placeholder="Entrez le mot de passe pour déverrouiller"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-xs text-red-600">{error}</p>
                )}
                {unlockAttempts > 0 && canAttemptUnlock && (
                  <p className="mt-2 text-xs text-amber-600">
                    Tentatives restantes avant pénalité: {3 - unlockAttempts}/3
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canAttemptUnlock || !password.trim()}
                className="w-full rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Déverrouiller l'application
              </button>
            </form>
          </>
        )}

        {penaltyLevel > 0 && canAttemptUnlock && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-center text-red-700">
              ⚠️ Attention: Vous êtes au niveau de pénalité {penaltyLevel + 1}.
              {penaltyLevel < 4 && (
                <span>
                  {" "}
                  La prochaine pénalité sera de {penaltyMessages[penaltyLevel + 1]}.
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

