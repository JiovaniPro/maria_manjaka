"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastContainer";
import { useLoading } from "@/hooks/useLoading";
import { LoadingScreen } from "@/components/LoadingScreen";
import api from "@/services/api";
import { SettingsIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

export default function ParametrePage() {
  const { showToast } = useToast();
  const isLoading = useLoading(1000);

  // État pour le changement de mot de passe de connexion
  const [loginPasswordForm, setLoginPasswordForm] = useState({
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmerMotDePasse: "",
  });
  const [showOldLoginPassword, setShowOldLoginPassword] = useState(false);
  const [showNewLoginPassword, setShowNewLoginPassword] = useState(false);
  const [showConfirmLoginPassword, setShowConfirmLoginPassword] = useState(false);
  const [isChangingLoginPassword, setIsChangingLoginPassword] = useState(false);

  // État pour le changement de mot de passe admin
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmerMotDePasse: "",
  });
  const [showOldAdminPassword, setShowOldAdminPassword] = useState(false);
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [showConfirmAdminPassword, setShowConfirmAdminPassword] = useState(false);
  const [isChangingAdminPassword, setIsChangingAdminPassword] = useState(false);

  const handleLoginPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginPasswordForm.ancienMotDePasse || !loginPasswordForm.nouveauMotDePasse || !loginPasswordForm.confirmerMotDePasse) {
      showToast("Veuillez remplir tous les champs", "warning");
      return;
    }

    if (loginPasswordForm.nouveauMotDePasse !== loginPasswordForm.confirmerMotDePasse) {
      showToast("Les nouveaux mots de passe ne correspondent pas", "error");
      return;
    }

    if (loginPasswordForm.nouveauMotDePasse.length < 6) {
      showToast("Le nouveau mot de passe doit contenir au moins 6 caractères", "warning");
      return;
    }

    try {
      setIsChangingLoginPassword(true);
      await api.put('/auth/change-password', {
        ancienMotDePasse: loginPasswordForm.ancienMotDePasse,
        nouveauMotDePasse: loginPasswordForm.nouveauMotDePasse,
      });

      showToast("Mot de passe de connexion changé avec succès", "success");
      setLoginPasswordForm({
        ancienMotDePasse: "",
        nouveauMotDePasse: "",
        confirmerMotDePasse: "",
      });
    } catch (error: any) {
      console.error("Erreur changement mot de passe:", error);
      const message = error.response?.data?.message || "Erreur lors du changement de mot de passe";
      showToast(message, "error");
    } finally {
      setIsChangingLoginPassword(false);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminPasswordForm.ancienMotDePasse || !adminPasswordForm.nouveauMotDePasse || !adminPasswordForm.confirmerMotDePasse) {
      showToast("Veuillez remplir tous les champs", "warning");
      return;
    }

    if (adminPasswordForm.nouveauMotDePasse !== adminPasswordForm.confirmerMotDePasse) {
      showToast("Les nouveaux mots de passe ne correspondent pas", "error");
      return;
    }

    try {
      setIsChangingAdminPassword(true);
      await api.put('/auth/change-admin-password', {
        ancienMotDePasse: adminPasswordForm.ancienMotDePasse,
        nouveauMotDePasse: adminPasswordForm.nouveauMotDePasse,
      });

      showToast("Mot de passe admin changé avec succès", "success");
      setAdminPasswordForm({
        ancienMotDePasse: "",
        nouveauMotDePasse: "",
        confirmerMotDePasse: "",
      });
      // Recharger la page pour mettre à jour le hook useAdminPassword dans les autres composants
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Erreur changement mot de passe admin:", error);
      const message = error.response?.data?.message || "Erreur lors du changement de mot de passe admin";
      showToast(message, "error");
    } finally {
      setIsChangingAdminPassword(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <SettingsIcon />
          <h1 className="text-3xl font-bold">Paramètres</h1>
        </div>
        <p className="mt-2 text-sm text-black/60">
          Gérez vos paramètres de sécurité et de compte
        </p>
      </header>

      <div className="space-y-6">
        {/* Section Mot de passe de connexion */}
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <LockIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold">Mot de passe de connexion</h2>
              <p className="text-sm text-black/60">
                Changez le mot de passe pour accéder au compte (admin@mariamanjaka.com)
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginPasswordChange} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Ancien mot de passe
              </label>
              <div className="relative">
                <input
                  type={showOldLoginPassword ? "text" : "password"}
                  value={loginPasswordForm.ancienMotDePasse}
                  onChange={(e) =>
                    setLoginPasswordForm({
                      ...loginPasswordForm,
                      ancienMotDePasse: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Entrez votre ancien mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldLoginPassword(!showOldLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
                >
                  {showOldLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewLoginPassword ? "text" : "password"}
                  value={loginPasswordForm.nouveauMotDePasse}
                  onChange={(e) =>
                    setLoginPasswordForm({
                      ...loginPasswordForm,
                      nouveauMotDePasse: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Entrez votre nouveau mot de passe (min. 6 caractères)"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewLoginPassword(!showNewLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
                >
                  {showNewLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmLoginPassword ? "text" : "password"}
                  value={loginPasswordForm.confirmerMotDePasse}
                  onChange={(e) =>
                    setLoginPasswordForm({
                      ...loginPasswordForm,
                      confirmerMotDePasse: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmLoginPassword(!showConfirmLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
                >
                  {showConfirmLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingLoginPassword}
              className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingLoginPassword ? "Changement en cours..." : "Changer le mot de passe de connexion"}
            </button>
          </form>
        </div>

        {/* Section Mot de passe admin */}
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <LockIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold">Mot de passe admin</h2>
              <p className="text-sm text-black/60">
                Changez le mot de passe pour voir les soldes en banque et modifier les transactions
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminPasswordChange} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Ancien mot de passe admin
              </label>
              <div className="relative">
                <input
                  type={showOldAdminPassword ? "text" : "password"}
                  value={adminPasswordForm.ancienMotDePasse}
                  onChange={(e) =>
                    setAdminPasswordForm({
                      ...adminPasswordForm,
                      ancienMotDePasse: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Entrez votre ancien mot de passe admin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldAdminPassword(!showOldAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
                >
                  {showOldAdminPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Nouveau mot de passe admin
              </label>
              <div className="relative">
                <input
                  type={showNewAdminPassword ? "text" : "password"}
                  value={adminPasswordForm.nouveauMotDePasse}
                  onChange={(e) =>
                    setAdminPasswordForm({
                      ...adminPasswordForm,
                      nouveauMotDePasse: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Entrez votre nouveau mot de passe admin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
                >
                  {showNewAdminPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Confirmer le nouveau mot de passe admin
              </label>
              <div className="relative">
                <input
                  type={showConfirmAdminPassword ? "text" : "password"}
                  value={adminPasswordForm.confirmerMotDePasse}
                  onChange={(e) =>
                    setAdminPasswordForm({
                      ...adminPasswordForm,
                      confirmerMotDePasse: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Confirmez votre nouveau mot de passe admin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmAdminPassword(!showConfirmAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
                >
                  {showConfirmAdminPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingAdminPassword}
              className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingAdminPassword ? "Changement en cours..." : "Changer le mot de passe admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

