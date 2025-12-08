// src/app/(admin)/dashboard/page.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import Chart from "chart.js/auto";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/hooks/useLoading";
import { SearchIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";
import api from "@/services/api";

// ====================================================================
// CONFIG & TYPES
// ====================================================================

type TrendDirection = "up" | "down";

// Structure de données pour les cartes financières
type FinancialCard = {
  title: string;
  amount: string; // Laissé en string pour supporter les formats (Ariary, $ etc.)
  variation: string;
  trend: TrendDirection;
};

// Structure de données pour la répartition des revenus
type RevenueBreakdown = { label: string; value: number; color: string };

// Structure de données pour les transactions
type Transaction = { date: string; description: string; montant: string };

// Structure de données pour les comptes
type Account = { name: string; solde: string };

// Structure de données pour le graphique linéaire
type TrendData = {
  months: string[];
  values: number[]; // en milliers
};

// ====================================================================
// COMPONENTS
// ====================================================================

import { useAdminPassword } from "@/hooks/useAdminPassword";
import { useSecurityLock } from "@/hooks/useSecurityLock";
import { SecurityLockModal } from "@/components/SecurityLockModal";

function SecureAccountCard({
  account,
  showToast,
}: {
  account: Account;
  showToast: (msg: string, type: "success" | "error" | "warning") => void;
}) {
  const { adminPassword } = useAdminPassword();
  const { recordFailedAttempt, resetFailedAttempts, remainingAttempts } = useSecurityLock();
  const [showSolde, setShowSolde] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearSoldeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (showSolde) {
      clearSoldeTimeout();
      timeoutRef.current = setTimeout(() => {
        setShowSolde(false);
        showToast("Solde masqué par sécurité.", "warning");
      }, 30000);
      return () => clearSoldeTimeout();
    }
  }, [showSolde, showToast, clearSoldeTimeout]);

  const handleToggle = () => {
    if (showSolde) {
      setShowSolde(false);
      clearSoldeTimeout();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      resetFailedAttempts();
      setShowSolde(true);
      setIsAuthModalOpen(false);
      setPassword("");
      showToast("Solde affiché.", "success");
    } else {
      recordFailedAttempt();
      // Calculer les tentatives restantes après l'enregistrement (on soustrait 1 car recordFailedAttempt vient d'être appelé)
      const attemptsAfter = remainingAttempts - 1;
      const message = attemptsAfter > 0 
        ? `Mot de passe incorrect. Tentatives restantes : ${attemptsAfter}`
        : "Mot de passe incorrect. Application bloquée.";
      showToast(message, "error");
      setPassword("");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3 transition hover:bg-zinc-50">
        <div>
          <p className="text-sm font-medium">{account.name}</p>
          <p className="text-xs text-black/50">Solde actuel</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">
            {showSolde ? account.solde : "****"}
          </p>
          <button
            onClick={handleToggle}
            className="rounded-full p-1 text-black/40 transition hover:bg-zinc-100 hover:text-blue-500"
          >
            {showSolde ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-blue-600">
              Accès Sécurisé
            </h2>
            <p className="mb-4 text-sm text-black/60">
              Entrez le code pour afficher le solde.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-center text-lg tracking-widest focus:border-blue-500"
                placeholder="••••"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-black/60 hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  Afficher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SecureFinancialCard({
  card,
  showToast,
}: {
  card: FinancialCard;
  showToast: (msg: string, type: "success" | "error" | "warning") => void;
}) {
  const { adminPassword } = useAdminPassword();
  const { recordFailedAttempt, resetFailedAttempts, remainingAttempts } = useSecurityLock();
  const [showSolde, setShowSolde] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearSoldeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (showSolde) {
      clearSoldeTimeout();
      timeoutRef.current = setTimeout(() => {
        setShowSolde(false);
        showToast("Solde masqué par sécurité.", "warning");
      }, 30000);
      return () => clearSoldeTimeout();
    }
  }, [showSolde, showToast, clearSoldeTimeout]);

  const handleToggle = () => {
    if (showSolde) {
      setShowSolde(false);
      clearSoldeTimeout();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      resetFailedAttempts();
      setShowSolde(true);
      setIsAuthModalOpen(false);
      setPassword("");
      showToast("Solde affiché.", "success");
    } else {
      recordFailedAttempt();
      // Calculer les tentatives restantes après l'enregistrement (on soustrait 1 car recordFailedAttempt vient d'être appelé)
      const attemptsAfter = remainingAttempts - 1;
      const message = attemptsAfter > 0 
        ? `Mot de passe incorrect. Tentatives restantes : ${attemptsAfter}`
        : "Mot de passe incorrect. Application bloquée.";
      showToast(message, "error");
      setPassword("");
    }
  };

  return (
    <>
      <article className="group relative cursor-pointer rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
        <div className="flex items-start justify-between">
          <p className="text-sm text-black/60">{card.title}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className="rounded-full p-1 text-black/40 transition hover:bg-zinc-100 hover:text-blue-500"
          >
            {showSolde ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        <p className="mt-3 text-3xl font-bold">
          {showSolde ? card.amount : "****"}
        </p>
        <div className="mt-5 flex items-center justify-between text-sm text-black/60">
          <MiniTrend direction={card.trend} />
          <span
            className={`font-semibold ${card.trend === "down" ? "text-red-500" : "text-emerald-500"
              }`}
          >
            {card.variation}
          </span>
        </div>
      </article>

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-blue-600">
              Accès Sécurisé
            </h2>
            <p className="mb-4 text-sm text-black/60">
              Entrez le code pour afficher le solde.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-center text-lg tracking-widest focus:border-blue-500"
                placeholder="••••"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-black/60 hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  Afficher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const isLoading = useLoading(1500);

  const [financialCards, setFinancialCards] = useState<FinancialCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([]);
  const [trendData, setTrendData] = useState<TrendData>({
    months: [],
    values: [],
  });
  const [loadingData, setLoadingData] = useState(true);

  // Palette de couleurs pour les catégories
  const colorPalette = [
    "#3b82f6", // bleu
    "#16a34a", // vert
    "#eab308", // jaune
    "#f97316", // orange
    "#ef4444", // rouge
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#ec4899", // rose
    "#14b8a6", // turquoise
    "#f59e0b", // ambre
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        // 1. Récupérer les stats du mois
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

        const statsResponse = await api.get(`/transactions/stats?dateDebut=${startOfMonth}&dateFin=${endOfMonth}`);
        const stats = statsResponse.data.data;

        // 2. Récupérer tous les comptes en une seule requête (optimisation)
        const allComptesResponse = await api.get('/comptes');
        const comptesData = allComptesResponse.data.data || [];
        
        // Filtrer côté frontend
        const comptesCaisse = comptesData.filter((c: any) => c.type === 'CAISSE');
        const comptesBanque = comptesData.filter((c: any) => c.type === 'BANQUE');

        // 3. Récupérer les dernières transactions
        const transactionsResponse = await api.get('/transactions?limit=3');
        const transactionsData = transactionsResponse.data.data;

        // 4. Récupérer toutes les transactions RECETTE du mois pour la répartition
        const recettesResponse = await api.get(
          `/transactions?type=RECETTE&dateDebut=${startOfMonth}&dateFin=${endOfMonth}&limit=1000`
        );
        const recettesData = recettesResponse.data.data || [];

        // 5. Récupérer les transactions des 7 derniers mois pour le graphique des tendances
        // OPTIMISATION: 2 requêtes globales au lieu de 14 (7 mois × 2 types)
        const startDate7Months = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
        const endDate7Months = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const globalStart = startDate7Months.toISOString();
        const globalEnd = endDate7Months.toISOString();
        
        // 2 requêtes globales pour toutes les transactions des 7 derniers mois
        const [allRecettesResponse, allDepensesResponse] = await Promise.all([
          api.get(`/transactions?type=RECETTE&dateDebut=${globalStart}&dateFin=${globalEnd}&limit=10000`),
          api.get(`/transactions?type=DEPENSE&dateDebut=${globalStart}&dateFin=${globalEnd}&limit=10000`)
        ]);
        
        const allRecettes = allRecettesResponse.data.data || [];
        const allDepenses = allDepensesResponse.data.data || [];
        
        // Grouper par mois côté frontend
        const monthsData: { month: string; revenues: number; expenses: number }[] = [];
        const monthMap = new Map<string, { revenues: number; expenses: number; monthName: string }>();
        
        // Initialiser les 7 mois
        for (let i = 6; i >= 0; i--) {
          const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
          const monthName = monthDate.toLocaleDateString('fr-FR', { month: 'short' });
          monthMap.set(monthKey, { revenues: 0, expenses: 0, monthName });
        }
        
        // Grouper les recettes par mois
        allRecettes.forEach((t: any) => {
          const transactionDate = new Date(t.dateTransaction);
          const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
          const monthData = monthMap.get(monthKey);
          if (monthData) {
            monthData.revenues += parseFloat(t.montant || 0);
          }
        });
        
        // Grouper les dépenses par mois
        allDepenses.forEach((t: any) => {
          const transactionDate = new Date(t.dateTransaction);
          const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
          const monthData = monthMap.get(monthKey);
          if (monthData) {
            monthData.expenses += parseFloat(t.montant || 0);
          }
        });
        
        // Convertir en tableau trié par mois
        for (let i = 6; i >= 0; i--) {
          const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
          const monthData = monthMap.get(monthKey);
          if (monthData) {
            monthsData.push({
              month: monthData.monthName,
              revenues: monthData.revenues / 1000, // Convertir en milliers pour l'affichage
              expenses: monthData.expenses / 1000,
            });
          }
        }
        
        setTrendData({
          months: monthsData.map(d => d.month),
          values: monthsData.map(d => d.revenues),
        });

        // Calculer les soldes totaux par type
        const soldeCaisse = comptesCaisse.reduce(
          (acc: number, c: any) => acc + parseFloat(c.soldeActuel || 0),
          0
        );
        // Aligner avec la page banque : prendre le compte bancaire principal et afficher en absolu (comme carte sécurisée)
        const mainBanque = comptesBanque[0];
        const soldeBanqueRaw = mainBanque ? parseFloat(mainBanque.soldeActuel || 0) : 0;
        const soldeBanque = Math.abs(soldeBanqueRaw);

        // Calculer la répartition des revenus par catégorie
        const categoryMap = new Map<string, number>();
        
        recettesData.forEach((t: any) => {
          const categoryName = t.categorie?.nom || 'Inconnue';
          const montant = parseFloat(t.montant || 0);
          const currentTotal = categoryMap.get(categoryName) || 0;
          categoryMap.set(categoryName, currentTotal + montant);
        });

        // Calculer le total des recettes
        const totalRecettes = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

        // Convertir en tableau avec pourcentages et couleurs
        const breakdown: RevenueBreakdown[] = Array.from(categoryMap.entries())
          .map(([label, value], index) => ({
            label,
            value: totalRecettes > 0 ? Math.round((value / totalRecettes) * 100) : 0,
            color: colorPalette[index % colorPalette.length],
          }))
          .sort((a, b) => b.value - a.value); // Trier par valeur décroissante

        setRevenueBreakdown(breakdown);

        setFinancialCards([
          {
            title: "Solde du mois",
            amount: formatCurrency(stats.soldeNet),
            variation: "+0%", // À calculer si on a les données du mois précédent
            trend: stats.soldeNet >= 0 ? "up" : "down",
          },
          {
            title: "Dépense du mois",
            amount: formatCurrency(stats.totalDepenses),
            variation: "+0%",
            trend: "down",
          },
          {
            title: "Solde en caisse",
            amount: formatCurrency(soldeCaisse),
            variation: "+0%",
            trend: "up",
          },
          {
            title: "Solde en banque",
            amount: formatCurrency(soldeBanque),
            variation: "+0%",
            trend: "up",
          },
        ]);

        // Préparer la liste des transactions
        setTransactions(transactionsData.map((t: any) => ({
          date: formatDate(t.dateTransaction),
          description: t.description || t.type,
          montant: formatCurrency(t.montant),
        })));

        // Préparer la liste des comptes
        setAccounts(comptesData.map((c: any) => ({
          name: c.nom,
          solde: formatCurrency(Math.abs(c.soldeActuel || 0)),
        })));

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        showToast("Erreur lors du chargement des données.", "error");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();

    // Écouter les événements de mise à jour des transactions
    const handleTransactionUpdate = () => {
      fetchData();
    };

    window.addEventListener('transaction-updated', handleTransactionUpdate);
    window.addEventListener('compte-updated', handleTransactionUpdate);

    return () => {
      window.removeEventListener('transaction-updated', handleTransactionUpdate);
      window.removeEventListener('compte-updated', handleTransactionUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuter une seule fois au montage du composant

  if (isLoading || (loadingData && financialCards.length === 0)) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm text-black/60">Bonjour, admin</p>
          <h1 className="text-2xl font-semibold">Bienvenue sur le tableau de bord</h1>
        </div>
        <div className="flex w-full max-w-sm items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2">
          <SearchIcon />
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder="Search..."
          />
        </div>
      </header>

      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-xl font-semibold">Tableau de Bord Financier</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {financialCards.map((card) =>
            card.title === "Solde en banque" ? (
              <SecureFinancialCard
                key={card.title}
                card={card}
                showToast={showToast}
              />
            ) : (
              <article
                key={card.title}
                className="group cursor-pointer rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
              >
                <p className="text-sm text-black/60">{card.title}</p>
                <p className="mt-3 text-3xl font-bold">{card.amount}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-black/60">
                  <MiniTrend direction={card.trend} />
                  <span
                    className={`font-semibold ${card.trend === "down" ? "text-red-500" : "text-emerald-500"
                      }`}
                  >
                    {card.variation}
                  </span>
                </div>
              </article>
            )
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Graphique des Tendances (Annuel)
              </h3>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                Revenus vs Dépenses
              </p>
            </div>
            <div className="mt-6 h-80 rounded-2xl border border-dashed border-black/10 bg-zinc-50 p-6">
              <LineChart data={trendData} />
            </div>
          </article>

          <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Répartition des Revenus</h3>
              <span className="text-sm text-black/60">
                {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="mt-6 flex flex-col items-center justify-center gap-8 md:flex-row">
              {revenueBreakdown.length > 0 ? (
                <>
                  <DonutChart data={revenueBreakdown} />
                  <ul className="space-y-4 text-sm">
                    {revenueBreakdown.map((item) => (
                      <li key={item.label} className="flex items-center gap-3">
                        <span
                          className="inline-block h-4 w-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="flex-1 font-medium">{item.label}</span>
                        <span className="font-semibold text-black">
                          {item.value}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-black/40">
                  <p className="text-sm">Aucune recette enregistrée ce mois</p>
                </div>
              )}
            </div>
          </article>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Dernières Transactions</h3>
              <button
                onClick={() => router.push('/transaction')}
                className="cursor-pointer text-xs uppercase tracking-[0.3em] text-black/40 transition hover:text-black hover:underline"
              >
                Voir tout
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {transactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3 transition hover:bg-zinc-50"
                >
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-black/50">{tx.date}</p>
                  </div>
                  <p className="text-sm font-semibold">{tx.montant}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Aperçus des Comptes</h3>
              {/* <button className="text-xs uppercase tracking-[0.3em] text-black/40 transition hover:text-black">
                Gérer
              </button> */}
            </div>
            <div className="mt-4 space-y-4">
              {accounts.map((account) => {
                const nameLower = account.name.toLowerCase();
                const isSensitiveAccount =
                  nameLower.includes('banque') || nameLower.includes('bni');
                return isSensitiveAccount ? (
                  <SecureAccountCard
                    key={account.name}
                    account={account}
                    showToast={showToast}
                  />
                ) : (
                  <div
                    key={account.name}
                    className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3 transition hover:bg-zinc-50"
                  >
                    <div>
                      <p className="text-sm font-medium">{account.name}</p>
                      <p className="text-xs text-black/50">Solde actuel</p>
                    </div>
                    <p className="text-sm font-semibold">{account.solde}</p>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>
      <SecurityLockModal />
    </div>
  );
}

// Composants graphiques
function LineChart({ data }: { data: TrendData }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.months,
        datasets: [
          {
            label: "My First Dataset",
            data: data.values,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
            pointRadius: 4,
            pointBackgroundColor: "#fff",
            pointBorderColor: "rgb(75, 192, 192)",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "rgba(0,0,0,0.8)",
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(0,0,0,0.05)",
            },
            ticks: {
              color: "rgba(0,0,0,0.6)",
            },
          },
          y: {
            grid: {
              color: "rgba(0,0,0,0.08)",
            },
            ticks: {
              color: "rgba(0,0,0,0.6)",
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [data]);

  return <canvas ref={canvasRef} aria-label="Line chart" role="img" />;
}

function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const [hoveredSegment, setHoveredSegment] = useState<{ label: string; value: number; color: string; x: number; y: number } | null>(null);
  const radius = 70;
  const innerRadius = 45;
  const circumference = 2 * Math.PI * radius;
  const rawTotal = data.reduce((sum, item) => sum + item.value, 0);
  const total = rawTotal > 0 ? rawTotal : 1; // éviter division par 0 pour l'affichage
  const displayTotal = 100; // Affiché au centre, toujours 100%
  let accumulated = 0;
  const startOffset = circumference * 0.25;
  const centerX = 100;
  const centerY = 100;

  return (
    <svg viewBox="0 0 200 200" className="h-56 w-56">
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="25"
      />
      {data.map((item, index) => {
        const dash = total > 0 ? (item.value / total) * circumference : 0;
        const dashOffset = startOffset - accumulated;
        const angle = (accumulated + dash / 2) / circumference * 2 * Math.PI - Math.PI / 2;
        const segmentX = centerX + Math.cos(angle) * radius;
        const segmentY = centerY + Math.sin(angle) * radius;
        const tooltipX = centerX + Math.cos(angle) * (radius + 26);
        const tooltipY = centerY + Math.sin(angle) * (radius + 26);
        accumulated += dash;

        return (
          <circle
            key={item.label}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth="25"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="cursor-pointer transition-opacity"
            style={{ opacity: hoveredSegment?.label === item.label ? 1 : hoveredSegment ? 0.5 : 1 }}
            onMouseEnter={() =>
              setHoveredSegment({
                ...item,
                x: tooltipX,
                y: tooltipY
              })
            }
            onMouseLeave={() => setHoveredSegment(null)}
          />
        );
      })}
      
      {/* Tooltip pour le donut */}
      {hoveredSegment && (
        <g>
          <rect
            x={hoveredSegment.x - 60}
            y={hoveredSegment.y - 35}
            width="120"
            height="30"
            fill="rgba(0, 0, 0, 0.85)"
            rx="6"
          />
          <text
            x={hoveredSegment.x}
            y={hoveredSegment.y - 18}
            textAnchor="middle"
            fontSize="10"
            fill="white"
            fontWeight="bold"
          >
            {hoveredSegment.label}
          </text>
          <text
            x={hoveredSegment.x}
            y={hoveredSegment.y - 5}
            textAnchor="middle"
            fontSize="9"
            fill={hoveredSegment.color}
          >
            {hoveredSegment.value}% du total
          </text>
        </g>
      )}
      <circle cx="100" cy="100" r={innerRadius} fill="white" />
      <text
        x="100"
        y="95"
        textAnchor="middle"
        fontSize="24"
        fontWeight="bold"
        fill="black"
      >
        {displayTotal}%
      </text>
      <text
        x="100"
        y="112"
        textAnchor="middle"
        fontSize="12"
        fill="rgba(0,0,0,0.5)"
      >
        Total
      </text>
    </svg>
  );
}

function MiniTrend({ direction }: { direction: "up" | "down" }) {
  const points =
    direction === "up" ? "0,18 8,10 15,14 24,4" : "0,6 8,12 15,8 24,18";
  const strokeColor = direction === "up" ? "#16a34a" : "#ef4444";
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-12 w-full"
      fill="none"
      stroke={strokeColor}
      strokeWidth={2}
    >
      <polyline points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}