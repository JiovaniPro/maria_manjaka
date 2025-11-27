// src/app/connexion/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/services/api"; // Import du service API

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        motDePasse
      });

      if (response.data && response.data.success) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        // Rediriger vers le dashboard
        router.push("/dashboard");
      } else {
        setError(response.data.message || "Erreur lors de la connexion.");
      }
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Impossible de se connecter au serveur. Vérifiez votre connexion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-sans text-white">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/15 bg-white/5 p-10 shadow-[0_0_60px_rgba(255,255,255,0.08)] backdrop-blur">
        <header className="space-y-2 text-center">
          {/* <p className="text-xs uppercase tracking-[0.4em] text-white/70">
            Maria Manjaka
          </p> */}
          <h2 className="text-3xl font-extrabold tracking-tight">Connexion</h2>
          <p className="text-sm text-white/60">
            Accédez à votre espace de gestion sécurisé.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em]" htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="mt-2 w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white focus:ring-2 focus:ring-white/60 disabled:opacity-50"
              placeholder="nom@exemple.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em]" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              disabled={isLoading}
              className="mt-2 w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white focus:ring-2 focus:ring-white/60 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Sécurisé & chiffré</span>
            <button
              type="button"
              className="underline decoration-dotted decoration-white/40 transition hover:text-white hover:decoration-white"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
            {!isLoading && (
              <span className="ml-3 text-base transition group-hover:translate-x-1">
                &rarr;
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}