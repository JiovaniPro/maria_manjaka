// src/app/(admin)/dashboard/page.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
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

// Structure de données pour le graphique de tendances
type TrendData = {
  months: string[];
  revenues: number[];
  expenses: number[];
};

// ====================================================================
// COMPONENTS
// ====================================================================

const SECRET_PASSWORD = "1234"; // Simulation

function SecureAccountCard({
  account,
  showToast,
}: {
  account: Account;
  showToast: (msg: string, type: "success" | "error" | "warning") => void;
}) {
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
    if (password === SECRET_PASSWORD) {
      setShowSolde(true);
      setIsAuthModalOpen(false);
      setPassword("");
      showToast("Solde affiché.", "success");
    } else {
      showToast("Mot de passe incorrect.", "error");
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
    if (password === SECRET_PASSWORD) {
      setShowSolde(true);
      setIsAuthModalOpen(false);
      setPassword("");
      showToast("Solde affiché.", "success");
    } else {
      showToast("Mot de passe incorrect.", "error");
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
    revenues: [],
    expenses: [],
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

        // 2. Récupérer les comptes par type (CAISSE et BANQUE)
        const [comptesCaisseResponse, comptesBanqueResponse, allComptesResponse] = await Promise.all([
          api.get('/comptes?type=CAISSE'),
          api.get('/comptes?type=BANQUE'),
          api.get('/comptes')
        ]);

        const comptesCaisse = comptesCaisseResponse.data.data || [];
        const comptesBanque = comptesBanqueResponse.data.data || [];
        const comptesData = allComptesResponse.data.data || [];

        // 3. Récupérer les dernières transactions
        const transactionsResponse = await api.get('/transactions?limit=3');
        const transactionsData = transactionsResponse.data.data;

        // 4. Récupérer toutes les transactions RECETTE du mois pour la répartition
        const recettesResponse = await api.get(
          `/transactions?type=RECETTE&dateDebut=${startOfMonth}&dateFin=${endOfMonth}&limit=1000`
        );
        const recettesData = recettesResponse.data.data || [];

        // 5. Récupérer les transactions des 7 derniers mois pour le graphique des tendances
        const monthsData: { month: string; revenues: number; expenses: number }[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString();
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString();
          
          const monthName = monthDate.toLocaleDateString('fr-FR', { month: 'short' });
          
          // Récupérer les transactions du mois
          const [monthRecettes, monthDepenses] = await Promise.all([
            api.get(`/transactions?type=RECETTE&dateDebut=${monthStart}&dateFin=${monthEnd}&limit=1000`),
            api.get(`/transactions?type=DEPENSE&dateDebut=${monthStart}&dateFin=${monthEnd}&limit=1000`)
          ]);
          
          const totalRecettes = monthRecettes.data.data.reduce((sum: number, t: any) => 
            sum + parseFloat(t.montant || 0), 0
          );
          const totalDepenses = monthDepenses.data.data.reduce((sum: number, t: any) => 
            sum + parseFloat(t.montant || 0), 0
          );
          
          monthsData.push({
            month: monthName,
            revenues: totalRecettes / 1000, // Convertir en milliers pour l'affichage
            expenses: totalDepenses / 1000,
          });
        }
        
        setTrendData({
          months: monthsData.map(d => d.month),
          revenues: monthsData.map(d => d.revenues),
          expenses: monthsData.map(d => d.expenses),
        });

        // Calculer les soldes totaux par type
        const soldeCaisse = comptesCaisse.reduce((acc: number, c: any) => 
          acc + parseFloat(c.soldeActuel || 0), 0
        );
        const soldeBanque = comptesBanque.reduce((acc: number, c: any) => 
          acc + parseFloat(c.soldeActuel || 0), 0
        );

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
          solde: formatCurrency(c.soldeActuel || 0),
        })));

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        showToast("Erreur lors du chargement des données.", "error");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [showToast]);

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
              <TrendChart data={trendData} />
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
              <button className="text-xs uppercase tracking-[0.3em] text-black/40 transition hover:text-black">
                Gérer
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {accounts.map((account) => {
                const isBanque = account.name.toLowerCase().includes('banque');
                return isBanque ? (
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
    </div>
  );
}

// Composants graphiques
function TrendChart({ data }: { data: TrendData }) {
  const [hoveredPoint, setHoveredPoint] = useState<{ month: string; revenue: number; expense: number; x: number; y: number } | null>(null);
  const maxValue = Math.max(...data.revenues, ...data.expenses);
  const chartHeight = 250;
  const chartWidth = 400;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const graphHeight = chartHeight - padding.top - padding.bottom;
  const graphWidth = chartWidth - padding.left - padding.right;
  
  const formatAmount = (value: number) => {
    const amount = value * 1000;
    const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} Ar`;
  };

  const pointsRevenues = data.revenues
    .map((value, index) => {
      const x =
        padding.left + (index * graphWidth) / (data.revenues.length - 1);
      const y = padding.top + graphHeight - (value / maxValue) * graphHeight;
      return { x, y, value, month: data.months[index] };
    });

  const pointsExpenses = data.expenses
    .map((value, index) => {
      const x =
        padding.left + (index * graphWidth) / (data.expenses.length - 1);
      const y = padding.top + graphHeight - (value / maxValue) * graphHeight;
      return { x, y, value, month: data.months[index] };
    });
  
  const handlePointHover = (index: number) => {
    const revenuePoint = pointsRevenues[index];
    const expensePoint = pointsExpenses[index];
    setHoveredPoint({
      month: revenuePoint.month,
      revenue: revenuePoint.value,
      expense: expensePoint.value,
      x: revenuePoint.x,
      y: revenuePoint.y - 20
    });
  };
  
  const handlePointLeave = () => {
    setHoveredPoint(null);
  };
  
  const revenuePath = pointsRevenues.map(p => `${p.x},${p.y}`).join(" ");
  const expensePath = pointsExpenses.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full">
      {/* Axe Y */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={chartHeight - padding.bottom}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="2"
      />
      {/* Axe X */}
      <line
        x1={padding.left}
        y1={chartHeight - padding.bottom}
        x2={chartWidth - padding.right}
        y2={chartHeight - padding.bottom}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="2"
      />

      {/* Labels Axe Y */}
      {[0, 50, 100, 150, 200].map((value, i) => (
        <g key={i}>
          <line
            x1={padding.left - 5}
            y1={padding.top + graphHeight - (value / maxValue) * graphHeight}
            x2={padding.left}
            y2={padding.top + graphHeight - (value / maxValue) * graphHeight}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
          />
          <text
            x={padding.left - 10}
            y={padding.top + graphHeight - (value / maxValue) * graphHeight + 4}
            textAnchor="end"
            fontSize="10"
            fill="rgba(0,0,0,0.5)"
          >
            {value}
          </text>
        </g>
      ))}

      {/* Labels Axe X */}
      {data.months.map((month, index) => (
        <text
          key={month}
          x={padding.left + (index * graphWidth) / (data.months.length - 1)}
          y={chartHeight - padding.bottom + 20}
          textAnchor="middle"
          fontSize="11"
          fill="rgba(0,0,0,0.6)"
        >
          {month}
        </text>
      ))}

      {/* Ligne Revenus */}
      <polyline
        points={revenuePath}
        fill="none"
        stroke="#16a34a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ligne Dépenses */}
      <polyline
        points={expensePath}
        fill="none"
        stroke="#ef4444"
        strokeWidth="3"
        strokeDasharray="6 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Points interactifs pour tooltips */}
      {pointsRevenues.map((point, index) => (
        <g key={`point-${index}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r="6"
            fill="#16a34a"
            className="cursor-pointer"
            onMouseEnter={() => handlePointHover(index)}
            onMouseLeave={handlePointLeave}
          />
          <circle
            cx={pointsExpenses[index].x}
            cy={pointsExpenses[index].y}
            r="6"
            fill="#ef4444"
            className="cursor-pointer"
            onMouseEnter={() => handlePointHover(index)}
            onMouseLeave={handlePointLeave}
          />
        </g>
      ))}
      
      {/* Tooltip */}
      {hoveredPoint && (
        <g>
          <rect
            x={hoveredPoint.x - 80}
            y={hoveredPoint.y - 50}
            width="160"
            height="45"
            fill="rgba(0, 0, 0, 0.85)"
            rx="8"
          />
          <text
            x={hoveredPoint.x}
            y={hoveredPoint.y - 35}
            textAnchor="middle"
            fontSize="10"
            fill="white"
            fontWeight="bold"
          >
            {hoveredPoint.month}
          </text>
          <text
            x={hoveredPoint.x}
            y={hoveredPoint.y - 20}
            textAnchor="middle"
            fontSize="9"
            fill="#86efac"
          >
            Revenus: {formatAmount(hoveredPoint.revenue)}
          </text>
          <text
            x={hoveredPoint.x}
            y={hoveredPoint.y - 5}
            textAnchor="middle"
            fontSize="9"
            fill="#fca5a5"
          >
            Dépenses: {formatAmount(hoveredPoint.expense)}
          </text>
        </g>
      )}

      {/* Label Axe Y */}
      <text
        x={padding.left - 35}
        y={chartHeight / 2}
        textAnchor="middle"
        fontSize="11"
        fill="rgba(0,0,0,0.5)"
        transform={`rotate(-90, ${padding.left - 35}, ${chartHeight / 2})`}
      >
        Montant ($)
      </text>

      {/* Label Axe X */}
      <text
        x={chartWidth / 2}
        y={chartHeight - 5}
        textAnchor="middle"
        fontSize="11"
        fill="rgba(0,0,0,0.5)"
      >
        Mois
      </text>
    </svg>
  );
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
  const total = data.reduce((sum, item) => sum + item.value, 0);
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
        const dash = (item.value / total) * circumference;
        const dashOffset = startOffset - accumulated;
        const angle = (accumulated + dash / 2) / circumference * 2 * Math.PI - Math.PI / 2;
        const segmentX = centerX + Math.cos(angle) * radius;
        const segmentY = centerY + Math.sin(angle) * radius;
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
            onMouseEnter={() => {
              setHoveredSegment({
                ...item,
                x: segmentX,
                y: segmentY
              });
            }}
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
        {total}%
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