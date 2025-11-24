"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

type Category = {
  id: string;
  nom: string;
  code: string;
  type: string;
  transactions: number;
  statut: "actif" | "inactif";
};

type NavItem = { label: string; icon: () => ReactElement; href: string };
type PreferenceItem = { label: string; icon: () => ReactElement };

const navItems: NavItem[] = [
  { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
  { label: "Transactions", icon: TransactionsIcon, href: "/transaction" },
  { label: "Comptes", icon: AccountsIcon, href: "/comptes" },
  { label: "Catégories", icon: CategoriesIcon, href: "/categorie" },
  { label: "Rapports", icon: ReportsIcon, href: "/rapports" },
  { label: "Utilisateurs", icon: UsersIcon, href: "/utilisateurs" },
];

const preferenceItems: PreferenceItem[] = [
  { label: "Paramètres", icon: SettingsIcon },
  { label: "Aide", icon: HelpIcon },
];

const revenueCategories: Category[] = [
  {
    id: "1",
    nom: "Dîme",
    code: "245",
    type: "138",
    transactions: 3100,
    statut: "actif",
  },
  {
    id: "2",
    nom: "Offrandes Cultes",
    code: "180",
    type: "180",
    transactions: 45,
    statut: "actif",
  },
  {
    id: "3",
    nom: "Vente de Livres",
    code: "160",
    type: "45",
    transactions: 0,
    statut: "inactif",
  },
  {
    id: "4",
    nom: "Dons",
    code: "200",
    type: "150",
    transactions: 125,
    statut: "actif",
  },
  {
    id: "5",
    nom: "Location de Salles",
    code: "175",
    type: "90",
    transactions: 8,
    statut: "actif",
  },
];

const expenseCategories: Category[] = [
  {
    id: "6",
    nom: "Loyer",
    code: "300",
    type: "250",
    transactions: 12,
    statut: "actif",
  },
  {
    id: "7",
    nom: "Salaires",
    code: "310",
    type: "280",
    transactions: 24,
    statut: "actif",
  },
  {
    id: "8",
    nom: "Électricité",
    code: "320",
    type: "200",
    transactions: 12,
    statut: "actif",
  },
  {
    id: "9",
    nom: "Entretien",
    code: "330",
    type: "180",
    transactions: 35,
    statut: "actif",
  },
  {
    id: "10",
    nom: "Évènements Caritatifs",
    code: "340",
    type: "220",
    transactions: 6,
    statut: "actif",
  },
];

export default function CategoriesPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"revenues" | "depenses">("revenues");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    type: "",
    statut: "actif" as "actif" | "inactif",
  });

  const currentCategories = activeTab === "revenues" ? revenueCategories : expenseCategories;

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        nom: category.nom,
        code: category.code,
        type: category.type,
        statut: category.statut,
      });
    } else {
      setEditingCategory(null);
      setFormData({ nom: "", code: "", type: "", statut: "actif" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ nom: "", code: "", type: "", statut: "actif" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sauvegarde catégorie:", formData);
    // TODO: Ajouter la logique de sauvegarde
    handleCloseModal();
  };

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
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Menu</p>
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
          <button className="flex w-full items-center gap-3 rounded-2xl border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white hover:text-black">
            <LogoutIcon />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 overflow-y-auto px-10 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
          <p className="mt-2 text-sm text-black/60">
            Organisez et classifiez les flux financiers
          </p>
        </header>

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/90"
          >
            <PlusIcon />
            <span>Ajouter une Catégorie</span>
          </button>
          <button className="flex items-center gap-2 rounded-2xl border border-black/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-black/5">
            <StarIcon />
            <span>Virement Interne</span>
          </button>
        </div>

        <div className="mb-6 flex gap-2 border-b border-black/10">
          <button
            onClick={() => setActiveTab("revenues")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === "revenues"
                ? "border-black text-black"
                : "border-transparent text-black/40"
            }`}
          >
            Catégories de Revenus
          </button>
          <button
            onClick={() => setActiveTab("depenses")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === "depenses"
                ? "border-black text-black"
                : "border-transparent text-black/40"
            }`}
          >
            Catégories de Dépenses
          </button>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="border-b border-black/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {activeTab === "revenues"
                  ? "Catégories de Revenus"
                  : "Catégories de Dépenses"}
              </h2>
              <button className="text-xs uppercase tracking-[0.3em] text-black/40">
                Voir tout
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-black/5 bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Nom
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Transactions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-black/5 transition hover:bg-zinc-50/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium">{category.nom}</td>
                    <td className="px-6 py-4 text-sm text-black/60">{category.code}</td>
                    <td className="px-6 py-4 text-sm text-black/60">{category.type}</td>
                    <td className="px-6 py-4 text-sm text-black/60">
                      {category.transactions}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          category.statut === "actif"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            category.statut === "actif" ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {category.statut === "actif" ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="rounded-lg p-2 text-black/60 transition hover:bg-black/5 hover:text-black"
                        >
                          <EditIcon />
                        </button>
                        <button className="rounded-lg p-2 text-black/60 transition hover:bg-red-50 hover:text-red-600">
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingCategory
                    ? "Modifier la Catégorie"
                    : "Nouvelle Catégorie"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="rounded-lg p-2 text-black/40 transition hover:bg-black/5 hover:text-black"
                >
                  <CloseIcon />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Nom de la Catégorie
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    required
                    className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
                    placeholder="Entrer une catégorie"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Code Budgétaire
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                    className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
                    placeholder="Ex: 245"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Type / Libellé
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                    className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
                    placeholder="Ex: 138"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Statut
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="statut"
                        value="actif"
                        checked={formData.statut === "actif"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            statut: e.target.value as "actif" | "inactif",
                          })
                        }
                        className="h-4 w-4 border-black/20 text-black focus:ring-2 focus:ring-black/20"
                      />
                      <span className="text-sm">Actif</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="statut"
                        value="inactif"
                        checked={formData.statut === "inactif"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            statut: e.target.value as "actif" | "inactif",
                          })
                        }
                        className="h-4 w-4 border-black/20 text-black focus:ring-2 focus:ring-black/20"
                      />
                      <span className="text-sm">Inactif</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/90"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 rounded-2xl border border-black/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Icons
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
      <path d="M12 15a3 3 0 110-6 3 3 0 010 6zm8.6-3.5l1.4 2.5-2.1 3.6-2.9-.3a7.1 7.1 0 01-1.6 1l-.5 2.8H9.1l-.5-2.8a7.1 7.1 0 01-1.6-1l-2.9.3-2.1-3.6 1.4-2.5a7.6 7.6 0 010-1l-1.4-2.5L4.1 4.4l2.9.3a7.1 7.1 0 011.6-1L9.1 1h5.8l.5 2.8a7.1 7.1 0 011.6 1l2.9-.3 2.1 3.6-1.4 2.5a7.6 7.6 0 010 1z" />
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14m-7-7h14" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

