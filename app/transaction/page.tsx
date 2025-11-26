"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useToast } from "@/components/ToastContainer"; // Vérifiez ce chemin d'import
import { LoadingScreen } from "@/components/LoadingScreen"; // Vérifiez ce chemin d'import
import { useLoading } from "@/hooks/useLoading"; // Vérifiez ce chemin d'import

// ====================================================================
// TYPES & CONSTANTES STATIQUES (API/APP)
// ====================================================================

// --- TYPES
type Transaction = {
  id: string;
  date: string;
  description: string;
  montant: number;
  montantAffiche?: string;
  type: "Revenu" | "Dépense";
  categorie: string;
  compte: string;
};

type Category = {
  id: string;
  nom: string;
  type: "Revenu" | "Dépense";
  statut: "actif" | "inactif";
};

type NavItem = { label: string; icon: () => ReactElement; href: string };
type PreferenceItem = { label: string; icon: () => ReactElement };
type SortField = "date" | "montant" | "description";
type SortOrder = "asc" | "desc" | null;

// --- CONSTANTES
const SECRET_PASSWORD = "1234"; // Simulation

const months = [
  { value: "", label: "Tous les mois" },
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

const years = ["", "2024", "2023", "2022", "2021"];

// --- NAVIGATION
const navItems: NavItem[] = [
  { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
  { label: "Transactions", icon: TransactionsIcon, href: "/transaction" },
  { label: "Catégories", icon: CategoriesIcon, href: "/categorie" },
  { label: "Transaction Bancaire", icon: UsersIcon, href: "/banque" },
];

const preferenceItems: PreferenceItem[] = [
  { label: "Paramètres", icon: SettingsIcon },
  // { label: "Aide", icon: HelpIcon },
];

// --- DONNÉES FACTICES INITIALES (À REMPLACER PAR VOTRE CHARGEMENT API)
const initialCategoriesData: Category[] = [
  { id: "1", nom: "Dîme", type: "Revenu", statut: "actif" },
  { id: "2", nom: "Offrandes Cultes", type: "Revenu", statut: "actif" },
  { id: "3", nom: "Vente de Livres", type: "Revenu", statut: "inactif" },
  { id: "4", nom: "Dons", type: "Revenu", statut: "actif" },
  { id: "5", nom: "Location de Salles", type: "Revenu", statut: "actif" },
  { id: "10", nom: "Loyer", type: "Dépense", statut: "actif" },
  { id: "11", nom: "Salaires", type: "Dépense", statut: "actif" },
  { id: "12", nom: "Électricité", type: "Dépense", statut: "actif" },
  { id: "13", nom: "Entretien", type: "Dépense", statut: "actif" },
  { id: "14", nom: "Matériel", type: "Dépense", statut: "actif" },
];

let initialTransactionsData: Transaction[] = [
  { id: "1", date: "2024-10-18", description: "Offrande Culte", montant: 1350, montantAffiche: "+1.350€", type: "Revenu", categorie: "Offrandes Cultes", compte: "Caisse" },
  { id: "2", date: "2024-10-18", description: "Achat Fournitures", montant: -300, montantAffiche: "-300€", type: "Dépense", categorie: "Matériel", compte: "Caisse" },
  { id: "3", date: "2024-11-15", description: "Offrande Culte", montant: 1350, montantAffiche: "+1.350€", type: "Revenu", categorie: "Offrandes Cultes", compte: "Caisse" },
  { id: "4", date: "2024-11-18", description: "Paiement Loyer", montant: -1120, montantAffiche: "-1120€", type: "Dépense", categorie: "Loyer", compte: "Banque A" },
  { id: "5", date: "2024-09-17", description: "Achat Fournitures", montant: -120, montantAffiche: "-120€", type: "Dépense", categorie: "Matériel", compte: "Banque A" },
  { id: "6", date: "2024-09-17", description: "Dîme J. Dupont", montant: 250, montantAffiche: "+250€", type: "Revenu", categorie: "Dîme", compte: "Caisse" },
  { id: "7", date: "2024-11-18", description: "Location Salle", montant: 250, montantAffiche: "+250€", type: "Revenu", categorie: "Location de Salles", compte: "Banque A" },
  { id: "8", date: "2024-12-05", description: "Dons Anonymes", montant: 250, montantAffiche: "+250€", type: "Revenu", categorie: "Dons", compte: "Caisse" },
];

// ====================================================================
// ICON COMPONENTS
// ====================================================================
// (Non modifiés, laissés pour que le code reste complet)

function DashboardIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" stroke="none"><path d="M4 3h7v9H4zM13 3h7v5h-7zM13 10h7v11h-7zM4 14h7v7H4z" /></svg>); }
function TransactionsIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M3 5h18v2H3zM3 11h18v2H3zM3 17h18v2H3z" /></svg>); }
function CategoriesIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" /></svg>); }
function UsersIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9v-1a5 5 0 015-5h4a5 5 0 015 5v1z" /></svg>); }
function SettingsIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 15a3 3 0 110-6 3 3 0 010 6zm8.6-3.5l1.4 2.5-2.1 3.6-2.9-.3a7.1 7.1 0 01-1.6 1l-.5 2.8H9.1l-.5-2.8a7.1 7.1 0 01-1.6-1l-2.9.3-2.1-3.6 1.4-2.5a7.6 7.6 0 010-1l-1.4-2.5L4.1 4.4l2.9.3a7.1 7.1 0 011.6-1L9.1 1h5.8l.5 2.8a7.1 7.1 0 011.6 1l2.9-.3 2.1 3.6-1.4 2.5a7.6 7.6 0 010 1z"/></svg>); }
function HelpIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 15h-1v-2h2v2zm1.1-4.4l-.6.4V14h-1v-2l1-.7a1.6 1.6 0 10-2.5-1.3H8.9A3.1 3.1 0 1113.1 12z" /></svg>); }
function LogoutIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M10 3h10v18H10v-2h8V5h-8zm-1 6l-4 3 4 3v-2h7v-2H9z" /></svg>); }
function IconChurch() { return (<svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v6m-4-2 4-4 4 4M5 22v-7l7-5 7 5v7z" strokeLinecap="round" /></svg>); }
function SearchIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5 text-black/40" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>); }
function PlusIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>); }
function CalendarIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>); }
function FilterIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l10 10V18l4 2v-7l10-10" /></svg>); }
function MenuIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>); }
function TagIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7l7 7" /></svg>); }
function CalculatorIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M8 6h8M8 10h8M8 14h8M8 18h4" /></svg>); }
function ArrowUpIcon() { return (<svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7l7 7" /></svg>); }
function ArrowDownIcon() { return (<svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7l-7-7" /></svg>); }
function EditIcon() { return (<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>); }
function DeleteIcon() { return (<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>); }
function CloseIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>); }
function RefreshIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9c-1.88 0-3.66.6-5.05 1.7L3 6M21 12h-4M3 12h4M6 18l-3-3h6l3 3m-9 0v-4" /></svg>); }
function ChevronLeftIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function ChevronRightIcon() { return (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function SortIcon({ field, currentField, order }: { field: SortField; currentField: SortField | null; order: SortOrder }) {
  if (currentField !== field) { return <svg viewBox="0 0 24 24" className="h-3 w-3 text-black/30" fill="currentColor"><path d="M12 5l6 6H6l6-6zM12 19l-6-6h12l-6 6z" /></svg>; }
  if (order === "asc") { return <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M12 5l6 6H6z" /></svg>; }
  if (order === "desc") { return <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M12 19l-6-6h12z" /></svg>; }
  return null;
}

// ====================================================================
// MODAL COMPONENTS (Extraits pour corriger le bug de focus)
// ====================================================================

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-bold text-red-600">{title}</h3>
        <p className="mb-6 text-sm text-black/80">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant de formulaire Transaction (EXTRAIT DU COMPOSANT PRINCIPAL)
function TransactionForm({ onSubmit, title, onClose, isModification = false, formData, handleInputChange, handleTypeChange, availableCategories, isCaisseDisabled, showNumeroCheque, soldeCaisse, soldeBanque }: {
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  onClose: () => void;
  isModification?: boolean;
  formData: any; // Utilisation de 'any' pour la simplicité, mais devrait être le type de 'formData'
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleTypeChange: (newType: "Revenu" | "Dépense") => void;
  availableCategories: Category[];
  isCaisseDisabled: boolean;
  showNumeroCheque: boolean;
  soldeCaisse: number;
  soldeBanque: number;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-black/40 transition hover:bg-black/5 hover:text-black"
          >
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Type de Transaction (Recette/Dépense) */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">
              Type de Transaction
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleTypeChange("Revenu")}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${
                  formData.type === "Revenu"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-black/10 bg-zinc-50 text-black/70 hover:bg-zinc-100"
                }`}
              >
                Recette (Revenu)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("Dépense")}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${
                  formData.type === "Dépense"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-black/10 bg-zinc-50 text-black/70 hover:bg-zinc-100"
                }`}
              >
                Dépense
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-black">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Montant */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-black">Montant (€)</label>
              <input
                type="number"
                name="montant"
                value={formData.montant}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                required
                // Ajout d'une clé pour s'assurer que l'input est re-rendu correctement si nécessaire (bonne pratique)
                key="montant-input" 
                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: Achat de fournitures, Offrande du mois..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Catégorie */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-black">Catégorie</label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" disabled>Sélectionner une catégorie</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.nom}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Compte (avec logique de désactivation Caisse) */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-black">
                {formData.type === "Dépense" ? "Compte à Débiter" : "Compte de Réception"}
              </label>
              <select
                name="compte"
                value={formData.compte}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" disabled>Sélectionner un compte</option>
                <option
                  value="Caisse"
                  disabled={isCaisseDisabled}
                  title={isCaisseDisabled ? `Solde Caisse actuel: ${soldeCaisse}€, montant trop élevé` : `Solde actuel: ${soldeCaisse}€`}
                  className={isCaisseDisabled ? "text-red-500" : ""}
                >
                  Caisse {isCaisseDisabled ? `(Solde insuffisant: ${soldeCaisse}€)` : `(${soldeCaisse}€)`}
                </option>
                <option value="Banque A">
                  Banque A ({soldeBanque}€)
                </option>
              </select>
            </div>
          </div>

          {/* Numéro de Chèque (conditionnel) */}
          {showNumeroCheque && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-black">
                Numéro de Chèque <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numeroCheque"
                value={formData.numeroCheque}
                onChange={handleInputChange}
                required={showNumeroCheque}
                className="w-full rounded-xl border border-red-500 bg-red-50 p-3 text-sm placeholder:text-red-300 focus:border-red-500 focus:ring-red-500"
                placeholder="Obligatoire pour un paiement par Banque A"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              {isModification ? "Enregistrer les modifications" : "Ajouter la Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function TransactionsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const isLoading = useLoading(1200);

  // --- VARIABLES D'ÉTAT POUR L'API (À ALIMENTER PAR VOS HOOKS API)
  // ⚠️ Remplacez ces useState par la récupération de données de votre API
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactionsData);
  const [categoriesData, setCategoriesData] = useState<Category[]>(initialCategoriesData); // Les catégories peuvent être chargées une fois
  const [soldeCaisse, setSoldeCaisse] = useState(500); // Solde actuel de la caisse
  const [soldeBanque, setSoldeBanque] = useState(10000); // Solde actuel de la banque
  // ------------------------------------------------------------------

  // --- Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompte, setFilterCompte] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterType, setFilterType] = useState<"" | "Revenu" | "Dépense">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  
  // --- Forcer le re-rendu après modification/suppression
  // Cette variable est maintenant gérée par le `setTransactions` du useState
  // const [dataVersion, setDataVersion] = useState(0); 

  // --- Add/Modify Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedTransactionToModify, setSelectedTransactionToModify] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    date: new Date().toISOString().substring(0, 10),
    description: "",
    montant: "",
    type: "Revenu" as "Revenu" | "Dépense",
    categorie: "",
    compte: "",
    numeroCheque: "",
  });

  // --- Security & Delete States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const itemsPerPage = 8;

  // --- Handlers & Logic

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterCompte("");
    setFilterCategorie("");
    setFilterMonth("");
    setFilterYear("");
    setFilterType("");
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === null) {
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortOrder(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (newType: "Revenu" | "Dépense") => {
    setFormData({
      ...formData,
      type: newType,
      categorie: "", // Reset categorie on type change
      compte: "", // Reset compte on type change
      numeroCheque: "",
    });
  };

  const getSortedTransactions = () => {
    let sorted = [...transactions]; // Utilisation de l'état 'transactions'
    
    // Si pas de tri, trier par date descendante par défaut
    if (!sortField) {
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted;
    }

    if (sortField && sortOrder) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortField === "date") {
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
        } else if (sortField === "montant") {
          aValue = a.montant;
          bValue = b.montant;
        } else if (sortField === "description") {
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase(); // Correction: b.description
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    return sorted;
  };

  const filteredTransactions = useMemo(() => {
    return getSortedTransactions().filter((t) => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCompte = filterCompte === "" || t.compte === filterCompte;
      const matchCategorie = filterCategorie === "" || t.categorie === filterCategorie;
      const matchType = filterType === "" || t.type === filterType;

      const transactionDate = new Date(t.date);
      const matchMonth = filterMonth === "" || transactionDate.getMonth() + 1 === parseInt(filterMonth);
      const matchYear = filterYear === "" || transactionDate.getFullYear() === parseInt(filterYear);

      return matchSearch && matchCompte && matchCategorie && matchType && matchMonth && matchYear;
    });
  }, [searchTerm, filterCompte, filterCategorie, filterType, filterMonth, filterYear, sortField, sortOrder, transactions]); // Dépendance à 'transactions' pour le re-calcul

  const totalMontant = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.montant, 0);
  }, [filteredTransactions]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const availableCategories = categoriesData.filter(
    (cat) => cat.type === formData.type && cat.statut === "actif"
  );

  const montantNumber = parseFloat(formData.montant) || 0;
  const isCaisseDisabled = formData.type === "Dépense" && montantNumber > soldeCaisse;
  const showNumeroCheque = formData.type === "Dépense" && formData.compte === "Banque A";


  // --- Security & Modify Logic

  const startModify = (transaction: Transaction) => {
    setSelectedTransactionToModify(transaction);
    setAuthPassword("");
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword === SECRET_PASSWORD) {
      showToast("Mot de passe correct. Ouverture du modal de modification.", "success");
      setIsAuthModalOpen(false);

      if (selectedTransactionToModify) {
        // Préremplir le formulaire avec les données de la transaction
        const montantAbsolu = Math.abs(selectedTransactionToModify.montant).toString();
        setFormData({
          id: selectedTransactionToModify.id,
          date: selectedTransactionToModify.date,
          description: selectedTransactionToModify.description,
          montant: montantAbsolu,
          type: selectedTransactionToModify.type,
          categorie: selectedTransactionToModify.categorie,
          compte: selectedTransactionToModify.compte,
          numeroCheque: "", // Dans une vraie application, cela viendrait de la transaction
        });
        setIsModifyModalOpen(true);
      }
    } else {
      showToast("Mot de passe incorrect.", "error");
      setAuthPassword("");
    }
  };

  const handleModifyTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (showNumeroCheque && !formData.numeroCheque) {
      showToast("Le numéro de chèque est obligatoire pour un paiement par banque", "warning");
      return;
    }

    // Mise à jour de l'état `transactions` au lieu du tableau global
    setTransactions(prevTransactions => {
        const index = prevTransactions.findIndex(t => t.id === formData.id);

        if (index !== -1) {
            const montantFinal = formData.type === "Revenu" ? montantNumber : -montantNumber;

            const updatedTransaction = {
                ...prevTransactions[index],
                date: formData.date,
                description: formData.description,
                montant: montantFinal,
                montantAffiche: montantFinal >= 0 ? `+${montantNumber}€` : `-${montantNumber}€`,
                type: formData.type,
                categorie: formData.categorie,
                compte: formData.compte,
            };

            const newTransactions = [...prevTransactions];
            newTransactions[index] = updatedTransaction;
            return newTransactions;
        }
        return prevTransactions;
    });

    showToast("Transaction modifiée avec succès", "success");
    setIsModifyModalOpen(false);
    setSelectedTransactionToModify(null);
    setFormData({
      id: "", date: new Date().toISOString().substring(0, 10), description: "", montant: "", type: "Revenu", categorie: "", compte: "", numeroCheque: "",
    });
  };

  // --- Delete Logic

  const startDelete = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
        // Mise à jour de l'état `transactions` au lieu du tableau global
        setTransactions(prevTransactions => {
            return prevTransactions.filter(t => t.id !== transactionToDelete);
        });

      showToast(`Transaction ${transactionToDelete} supprimée.`, "error");
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  // --- Add Logic

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (showNumeroCheque && !formData.numeroCheque) {
      showToast("Le numéro de chèque est obligatoire pour un paiement par banque", "warning");
      return;
    }

    if (montantNumber <= 0) {
      showToast("Le montant doit être supérieur à zéro", "warning");
      return;
    }

    const newTransaction: Transaction = {
      // Génération d'un ID unique simple (ajuster pour votre API)
      id: (transactions.length > 0 ? (parseInt(transactions[transactions.length - 1].id) + 1).toString() : "1"), 
      date: formData.date,
      description: formData.description,
      montant: formData.type === "Revenu" ? montantNumber : -montantNumber,
      montantAffiche: formData.type === "Revenu" ? `+${montantNumber}€` : `-${montantNumber}€`,
      type: formData.type,
      categorie: formData.categorie,
      compte: formData.compte,
    };

    // Mise à jour de l'état `transactions` au lieu du tableau global
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);

    showToast("Transaction ajoutée avec succès", "success");
    setIsAddModalOpen(false);
    setFormData({
      id: "", date: new Date().toISOString().substring(0, 10), description: "", montant: "", type: "Revenu", categorie: "", compte: "", numeroCheque: "",
    });
  };

  const handleLogout = () => {
    showToast("Déconnexion réussie", "success");
    // Navigation immédiate pour éviter l'erreur de composant non monté
    router.push("/connexion"); 
  };

  if (isLoading) {
    return <LoadingScreen />;
  }


  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-black">
      {/* Sidebar (Menu de gauche) */}
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="mt-2 text-sm text-black/60">
            Gérez et suivez toutes vos transactions financières
          </p>
        </header>

        {/* Barre de recherche et filtres */}
        <div className="mb-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            {/* Search Input */}
            <div className="flex flex-1 items-center gap-3 rounded-full border border-black/10 bg-zinc-50 px-4 py-2.5">
              <SearchIcon />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/40"
                placeholder="Filtrer par description..."
              />
            </div>
            {/* Add Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-full border border-blue-500 bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              <PlusIcon />
              <span>Ajouter une Transaction</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <CalendarIcon />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent cursor-pointer text-sm outline-none"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <CalendarIcon />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-transparent cursor-pointer text-sm outline-none"
              >
                <option value="">Toutes les années</option>
                {years.slice(1).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <FilterIcon />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "" | "Revenu" | "Dépense")}
                className="bg-transparent cursor-pointer text-sm outline-none"
              >
                <option value="">Tous les types</option>
                <option value="Revenu">Recettes</option>
                <option value="Dépense">Dépenses</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <MenuIcon />
              <select
                value={filterCompte}
                onChange={(e) => setFilterCompte(e.target.value)}
                className="bg-transparent cursor-pointer text-sm outline-none"
              >
                <option value="">Tous les comptes</option>
                <option value="Caisse">Caisse</option>
                <option value="Banque A">Banque A</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <TagIcon />
              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="bg-transparent cursor-pointer text-sm outline-none"
              >
                <option value="">Toutes les catégories</option>
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.nom}>{cat.nom}</option>
                ))}
              </select>
            </div>
            
            {/* Reset Filter Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 cursor-pointer rounded-full border border-black/10 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-black/70 transition hover:bg-zinc-100"
            >
              <RefreshIcon />
              <span>Réinitialiser</span>
            </button>


            {/* Total Montant */}
            <div className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 font-semibold ${
              totalMontant >= 0
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-red-500 bg-red-50 text-red-700"
            }`}>
              <CalculatorIcon />
              <span className="text-sm">
                Total: {totalMontant >= 0 ? '+' : ''}{totalMontant.toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

        {/* Tableau des transactions */}
        <div className="rounded-3xl border border-black/5 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="border-b border-black/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Liste des Transactions</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-black/60">
                  {filteredTransactions.length} transaction(s)
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-black/5 bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/60 transition hover:text-black"
                    >
                      Date
                      <SortIcon field="date" currentField={sortField} order={sortOrder} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("description")}
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/60 transition hover:text-black"
                    >
                      Description
                      <SortIcon field="description" currentField={sortField} order={sortOrder} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("montant")}
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/60 transition hover:text-black"
                    >
                      Montant
                      <SortIcon field="montant" currentField={sortField} order={sortOrder} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Compte
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-black/5 transition hover:bg-zinc-50/50"
                  >
                    <td className="px-6 py-4 text-sm text-black/60">
                      {new Date(transaction.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{transaction.description}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          transaction.montant > 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {transaction.montantAffiche || transaction.montant.toFixed(2) + '€'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          transaction.type === "Revenu"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {transaction.type === "Revenu" ? (
                          <ArrowUpIcon />
                        ) : (
                          <ArrowDownIcon />
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black/60">{transaction.categorie}</td>
                    <td className="px-6 py-4 text-sm text-black/60">{transaction.compte}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => startModify(transaction)}
                          title="Modifier la transaction"
                          className="rounded-full p-2 text-black/60 transition hover:bg-zinc-100 hover:text-blue-500"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => startDelete(transaction.id)}
                          title="Supprimer la transaction"
                          className="rounded-full p-2 text-black/60 transition hover:bg-zinc-100 hover:text-red-500"
                        >
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

        {/* Pagination */}
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-black/10 p-2.5 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeftIcon />
              </button>
              <span className="min-w-[80px] text-center text-sm font-medium text-black/70">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-black/10 p-2.5 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Modal d'ajout de transaction */}
        {isAddModalOpen && (
          <TransactionForm
            onSubmit={handleAddTransaction}
            title="Nouvelle Transaction"
            onClose={() => setIsAddModalOpen(false)}
            formData={formData}
            handleInputChange={handleInputChange}
            handleTypeChange={handleTypeChange}
            availableCategories={availableCategories}
            isCaisseDisabled={isCaisseDisabled}
            showNumeroCheque={showNumeroCheque}
            soldeCaisse={soldeCaisse}
            soldeBanque={soldeBanque}
          />
        )}

        {/* Modal de Confirmation de Mot de Passe pour Modification */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
              <h2 className="mb-6 text-xl font-bold">Autorisation Requise</h2>
              <form onSubmit={handleAuthSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Mot de Passe de Modification (Simulé: **{SECRET_PASSWORD}**)
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Entrez le mot de passe"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Déverrouiller
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Modification de transaction */}
        {isModifyModalOpen && (
          <TransactionForm
            onSubmit={handleModifyTransaction}
            title={`Modifier Transaction #${formData.id}`}
            onClose={() => setIsModifyModalOpen(false)}
            isModification={true}
            formData={formData}
            handleInputChange={handleInputChange}
            handleTypeChange={handleTypeChange}
            availableCategories={availableCategories}
            isCaisseDisabled={isCaisseDisabled}
            showNumeroCheque={showNumeroCheque}
            soldeCaisse={soldeCaisse}
            soldeBanque={soldeBanque}
          />
        )}

        {/* Modal de Confirmation de Suppression (Simule ConfirmModal.tsx) */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmation de Suppression"
          message={`Êtes-vous sûr de vouloir supprimer la transaction **${transactionToDelete}** ? Cette action est irréversible.`}
        />

      </main>
    </div>
  );
}