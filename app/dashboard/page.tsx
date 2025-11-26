"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/hooks/useLoading";

// ====================================================================
// CONFIG & TYPES
// ====================================================================

type NavItem = { label: string; icon: () => ReactElement; href: string };
type PreferenceItem = { label: string; icon: () => ReactElement };
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
// API DATA SIMULATION (À REMPLACER PAR VOTRE FETCH/HOOK API)
// ====================================================================

/**
 * ⚠️ IMPORTANT : Remplacez tout le bloc ci-dessous 
 * par votre logique de récupération de données API (e.g., const { cards, breakdown, ... } = useDashboardData();).
 */

const financialCards: FinancialCard[] = [
  {
    title: "Solde du mois",
    amount: "5.654.600 Ariary",
    variation: "+30%",
    trend: "up",
  },
  {
    title: "Dépense du mois",
    amount: "2.150.000 Ariary",
    variation: "-5%",
    trend: "down",
  },
  {
    title: "Solde en caisse",
    amount: "1.545.000 Ariary",
    variation: "+10%",
    trend: "up",
  },
  {
    title: "Solde en banque",
    amount: "12.500.000 Ariary", // Ajout d'une valeur pour l'exemple
    variation: "+18%",
    trend: "up",
  },
];

const revenueBreakdown: RevenueBreakdown[] = [
  { label: "Dîmes", value: 45, color: "#3b82f6" },
  { label: "Offrandes", value: 30, color: "#16a34a" },
  { label: "Dons", value: 15, color: "#eab308" },
  { label: "Ventes", value: 7, color: "#f97316" },
  { label: "Autres", value: 3, color: "#ef4444" },
];

const transactions: Transaction[] = [
  { date: "15 Jan", description: "Offrande spéciale", montant: "+$2.450" },
  { date: "13 Jan", description: "Paiement facture", montant: "-$600" },
  { date: "10 Jan", description: "Dîme collective", montant: "+$4.120" },
];

const accounts: Account[] = [
  { name: "Compte principal", solde: "$98.200" },
  { name: "Fonds missionnaires", solde: "$27.560" },
  { name: "Épargne projets", solde: "$12.870" },
];

const trendData: TrendData = {
  months: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul"],
  revenues: [160, 130, 120, 80, 90, 50, 70],
  expenses: [120, 110, 140, 130, 150, 120, 100],
};

// ====================================================================
// FIN API DATA SIMULATION
// ====================================================================

// Les constantes de navigation ne sont pas considérées comme des "fake data" d'API, 
// mais je les laisse ici pour que le code reste complet.
const navItems: NavItem[] = [
  { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
  { label: "Transactions", icon: TransactionsIcon, href: "/transaction" },
  // { label: "Comptes", icon: AccountsIcon, href: "/comptes" },
  { label: "Catégories", icon: CategoriesIcon, href: "/categorie" },
  // { label: "Rapports", icon: ReportsIcon, href: "/rapports" },
  { label: "Transaction Bancaire", icon: UsersIcon, href: "/banque" },
];

const preferenceItems: PreferenceItem[] = [
  { label: "Paramètres", icon: SettingsIcon },
  // { label: "Aide", icon: HelpIcon },
];

// ... (Le reste des composants et icônes suit)

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const isLoading = useLoading(1500);

  const handleLogout = () => {
    showToast("Déconnexion réussie", "success");
    setTimeout(() => {
      router.push("/connexion");
    }, 1000);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-black">
      <aside className="sticky top-0 flex h-screen w-72 flex-col justify-between bg-black px-6 py-8 text-white">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <IconChurch />
            <div className="text-sm font-semibold uppercase tracking-[0.3em]">
              MARIA MANJAKA
            </div>
          </div>
          <nav className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Menu
            </p>
            <ul className="space-y-2">
              {navItems.map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${
                        isActive
                          ? "bg-white text-black"
                          : "text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="space-y-4 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Préférences
          </p>
          <ul className="space-y-2">
            {preferenceItems.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/10">
                  <Icon />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white hover:text-black"
          >
            <LogoutIcon />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 overflow-y-auto px-10 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm text-black/60">Hi, Pasteur Jean!</p>
            <h1 className="text-2xl font-semibold">Welcome back to Dashboard</h1>
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
            {financialCards.map((card) => (
              <article
                key={card.title}
                className="group rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] hover:-translate-y-1 cursor-pointer"
              >
                <p className="text-sm text-black/60">{card.title}</p>
                <p className="mt-3 text-3xl font-bold">{card.amount}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-black/60">
                  <MiniTrend direction={card.trend} />
                  <span
                    className={`font-semibold ${
                      card.trend === "down" ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {card.variation}
                  </span>
                </div>
              </article>
            ))}
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
                <h3 className="text-lg font-semibold">
                  Répartition des Revenus
                </h3>
                <span className="text-sm text-black/60">Année 2025</span>
              </div>
              <div className="mt-6 flex flex-col items-center justify-center gap-8 md:flex-row">
                <DonutChart data={revenueBreakdown} />
                <ul className="space-y-4 text-sm">
                  {revenueBreakdown.map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                      <span
                        className="inline-block h-4 w-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="flex-1 font-medium">{item.label}</span>
                      <span className="font-semibold text-black">{item.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Dernières Transactions</h3>
                <button className="text-xs uppercase tracking-[0.3em] text-black/40 hover:text-black hover:underline transition cursor-pointer">
                  Voir tout
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.description}
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
                <button className="text-xs uppercase tracking-[0.3em] text-black/40 hover:text-black transition">
                  Gérer
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {accounts.map((account) => (
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
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

// Composants graphiques
function TrendChart({ data }: { data: typeof trendData }) {
  const maxValue = Math.max(...data.revenues, ...data.expenses);
  const chartHeight = 250;
  const chartWidth = 400;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const graphHeight = chartHeight - padding.top - padding.bottom;
  const graphWidth = chartWidth - padding.left - padding.right;

  const pointsRevenues = data.revenues
    .map((value, index) => {
      const x = padding.left + (index * graphWidth) / (data.revenues.length - 1);
      const y = padding.top + graphHeight - (value / maxValue) * graphHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const pointsExpenses = data.expenses
    .map((value, index) => {
      const x = padding.left + (index * graphWidth) / (data.expenses.length - 1);
      const y = padding.top + graphHeight - (value / maxValue) * graphHeight;
      return `${x},${y}`;
    })
    .join(" ");

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
        points={pointsRevenues}
        fill="none"
        stroke="#16a34a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ligne Dépenses */}
      <polyline
        points={pointsExpenses}
        fill="none"
        stroke="#ef4444"
        strokeWidth="3"
        strokeDasharray="6 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

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
  const radius = 70;
  const innerRadius = 45;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulated = 0;
  const startOffset = circumference * 0.25;

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
      {data.map((item) => {
        const dash = (item.value / total) * circumference;
        const dashOffset = startOffset - accumulated;
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
          />
        );
      })}
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

// Icons (tous identiques à avant)
function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      stroke="none"
    >
      <path d="M4 3h7v9H4zM13 3h7v5h-7zM13 10h7v11h-7zM4 14h7v7H4z" />
    </svg>
  );
}

function TransactionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M3 5h18v2H3zM3 11h18v2H3zM3 17h18v2H3z" />
    </svg>
  );
}

function AccountsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M4 4h16v6H4zM4 14h16v6H4z" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M5 3h4l2 3h8v15H5z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9v-1a5 5 0 015-5h4a5 5 0 015 5v1z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 15a3 3 0 110-6 3 3 0 010 6zm8.6-3.5l1.4 2.5-2.1 3.6-2.9-.3a7.1 7.1 0 01-1.6 1l-.5 2.8H9.1l-.5-2.8a7.1 7.1 0 01-1.6-1l-2.9.3-2.1-3.6 1.4-2.5a7.6 7.6 0 010-1l-1.4-2.5L4.1 4.4l2.9.3a7.1 7.1 0 011.6-1L9.1 1h5.8l.5 2.8a7.1 7.1 0 011.6 1l2.9-.3 2.1 3.6-1.4 2.5a7.6 7.6 0 010 1z"/>
</svg>
);
}
function HelpIcon() {
return (
<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 15h-1v-2h2v2zm1.1-4.4l-.6.4V14h-1v-2l1-.7a1.6 1.6 0 10-2.5-1.3H8.9A3.1 3.1 0 1113.1 12z" />
</svg>
);
}
function LogoutIcon() {
return (
<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
<path d="M10 3h10v18H10v-2h8V5h-8zm-1 6l-4 3 4 3v-2h7v-2H9z" />
</svg>
);
}
function SearchIcon() {
return (
<svg
   viewBox="0 0 24 24"
   className="h-5 w-5 flex-none text-black/40"
   fill="currentColor"
 >
<path d="M15.5 14h-.8l-.3-.3a6 6 0 10-.7.7l.3.3v.8L20 21.5 21.5 20zm-5.5 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
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
function IconChurch() {
return (
<svg
   viewBox="0 0 24 24"
   className="h-8 w-8 text-white"
   fill="none"
   stroke="currentColor"
   strokeWidth="1.5"
 >
<path d="M12 2v6m-4-2 4-4 4 4M5 22v-7l7-5 7 5v7z" strokeLinecap="round" />
</svg>
);
}