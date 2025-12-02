// src/app/(admin)/transaction/page.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/hooks/useLoading";
import { TransactionForm } from "@/components/TransactionForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import api from "@/services/api";
import {
  SearchIcon,
  PlusIcon,
  CalendarIcon,
  FilterIcon,
  MenuIcon,
  TagIcon,
  CalculatorIcon,
  EditIcon,
  DeleteIcon,
  RefreshIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/Icons";

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
  categorieId?: number; // Pour l'API
  compteId?: number; // Pour l'API
};

type Category = {
  id: string;
  nom: string;
  type: "Revenu" | "Dépense";
  statut: "actif" | "inactif";
};

type Account = {
  id: number;
  nom: string;
  solde: number;
};

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

const years = ["", "2025", "2024", "2023", "2022"];

// ====================================================================
// ICON COMPONENTS
// ====================================================================

function SortIcon({
  field,
  currentField,
  order,
}: {
  field: SortField;
  currentField: SortField | null;
  order: SortOrder;
}) {
  if (currentField !== field) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3 text-black/30"
        fill="currentColor"
      >
        <path d="M12 5l6 6H6l6-6zM12 19l-6-6h12l-6 6z" />
      </svg>
    );
  }
  if (order === "asc") {
    return (
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
        <path d="M12 5l6 6H6z" />
      </svg>
    );
  }
  if (order === "desc") {
    return (
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
        <path d="M12 19l-6-6h12z" />
      </svg>
    );
  }
  return null;
}

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function TransactionsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const isLoading = useLoading(1200);

  // --- VARIABLES D'ÉTAT POUR L'API
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [soldeCaisse, setSoldeCaisse] = useState(0);
  const [soldeBanque, setSoldeBanque] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
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

  // --- Add/Modify Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedTransactionToModify, setSelectedTransactionToModify] =
    useState<Transaction | null>(null);
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
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  const itemsPerPage = 8;

  // --- Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA' }).format(amount);
  };


  const formatDate = (dateString: string) => {
    return dateString.split('T')[0];
  };

  // --- Fetch Data
  const fetchData = async () => {
    try {
      setLoadingData(true);

      // 1. Transactions
      const transactionsRes = await api.get('/transactions?limit=100');
      const transactionsApi = transactionsRes.data.data;

      // 2. Categories
      const categoriesRes = await api.get('/categories');
      const categoriesApi = categoriesRes.data.data;

      // 3. Comptes
      const comptesRes = await api.get('/comptes');
      const comptesApi = comptesRes.data.data;

      // Map Transactions
      const mappedTransactions: Transaction[] = transactionsApi.map((t: any) => ({
        id: t.id.toString(),
        date: formatDate(t.dateTransaction),
        description: t.description || t.type,
        montant: parseFloat(t.montant), // CRITICAL: Parse as number to prevent string concatenation
        montantAffiche: t.type === 'RECETTE' ? `+${formatCurrency(t.montant)}` : `-${formatCurrency(t.montant)}`,
        type: t.type === 'RECETTE' ? 'Revenu' : 'Dépense',
        categorie: t.categorie?.nom || 'Inconnue',
        compte: t.compte?.nom || 'Inconnu',
        categorieId: t.categorieId,
        compteId: t.compteId
      }));

      // Map Categories
      const mappedCategories: Category[] = categoriesApi.map((c: any) => ({
        id: c.id.toString(),
        nom: c.nom,
        type: c.type === 'RECETTE' ? 'Revenu' : 'Dépense',
        statut: c.statut ? c.statut.toLowerCase() : 'actif'
      }));

      // Map Accounts
      setAccountsData(comptesApi);
      
      // Trouver les comptes par type (plus fiable que par nom)
      const caisse = comptesApi.find((c: any) => c.type === 'CAISSE');
      const banque = comptesApi.find((c: any) => c.type === 'BANQUE');

      // Calculer les soldes totaux par type (au cas où il y aurait plusieurs comptes)
      const soldeCaisseTotal = comptesApi
        .filter((c: any) => c.type === 'CAISSE')
        .reduce((acc: number, c: any) => acc + parseFloat(c.soldeActuel || 0), 0);
      const soldeBanqueTotal = comptesApi
        .filter((c: any) => c.type === 'BANQUE')
        .reduce((acc: number, c: any) => acc + parseFloat(c.soldeActuel || 0), 0);

      setSoldeCaisse(soldeCaisseTotal);
      setSoldeBanque(soldeBanqueTotal);

      setTransactions(mappedTransactions);
      setCategoriesData(mappedCategories);

    } catch (error) {
      console.error("Erreur chargement données:", error);
      showToast("Erreur lors du chargement des données", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    let sorted = [...transactions];

    if (!sortField) {
      sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
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
          bValue = b.description.toLowerCase();
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
      const matchSearch = t.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCompte = filterCompte === "" || t.compte === filterCompte;
      const matchCategorie =
        filterCategorie === "" || t.categorie === filterCategorie;
      const matchType = filterType === "" || t.type === filterType;

      const transactionDate = new Date(t.date);
      const matchMonth =
        filterMonth === "" ||
        transactionDate.getMonth() + 1 === parseInt(filterMonth);
      const matchYear =
        filterYear === "" ||
        transactionDate.getFullYear() === parseInt(filterYear);

      return (
        matchSearch &&
        matchCompte &&
        matchCategorie &&
        matchType &&
        matchMonth &&
        matchYear
      );
    });
  }, [
    searchTerm,
    filterCompte,
    filterCategorie,
    filterType,
    filterMonth,
    filterYear,
    sortField,
    sortOrder,
    transactions,
  ]);

  const totalMontant = useMemo(() => {
    // Calculer le total en tenant compte du type (Revenu = +, Dépense = -)
    // CRITICAL: Use parseFloat to ensure numeric addition, not string concatenation
    return filteredTransactions.reduce((sum, t) => {
      const amount = parseFloat(t.montant.toString());
      return t.type === 'Revenu' ? sum + amount : sum - amount;
    }, 0);
  }, [filteredTransactions]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const availableCategories = categoriesData.filter(
    (cat) => cat.type === formData.type && cat.statut === "actif"
  );

  const montantNumber = parseFloat(formData.montant) || 0;
  const isCaisseDisabled =
    formData.type === "Dépense" && montantNumber > soldeCaisse;
  const showNumeroCheque =
    formData.type === "Dépense" && formData.compte.toLowerCase().includes("banque");

  // --- Security & Modify Logic

  const startModify = (transaction: Transaction) => {
    setSelectedTransactionToModify(transaction);
    setAuthPassword("");
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword === SECRET_PASSWORD) {
      showToast(
        "Mot de passe correct. Ouverture du modal de modification.",
        "success"
      );
      setIsAuthModalOpen(false);

      if (selectedTransactionToModify) {
        const montantAbsolu = Math.abs(
          selectedTransactionToModify.montant
        ).toString();
        setFormData({
          id: selectedTransactionToModify.id,
          date: selectedTransactionToModify.date,
          description: selectedTransactionToModify.description,
          montant: montantAbsolu,
          type: selectedTransactionToModify.type,
          categorie: selectedTransactionToModify.categorie,
          compte: selectedTransactionToModify.compte,
          numeroCheque: "",
        });
        setIsModifyModalOpen(true);
      }
    } else {
      showToast("Mot de passe incorrect.", "error");
      setAuthPassword("");
    }
  };

  const handleModifyTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showNumeroCheque && !formData.numeroCheque) {
      showToast(
        "Le numéro de chèque est obligatoire pour un paiement par banque",
        "warning"
      );
      return;
    }

    try {
      // Trouver les IDs correspondants aux noms
      const cat = categoriesData.find(c => c.nom === formData.categorie);
      const acc = accountsData.find(a => a.nom === formData.compte);

      if (!cat || !acc) {
        showToast("Catégorie ou compte invalide", "error");
        return;
      }

      await api.put(`/transactions/${formData.id}`, {
        categorieId: parseInt(cat.id),
        compteId: acc.id,
        dateTransaction: formData.date,
        description: formData.description,
        montant: parseFloat(formData.montant),
        type: formData.type === 'Revenu' ? 'RECETTE' : 'DEPENSE'
      });

      showToast("Transaction modifiée avec succès", "success");
      setIsModifyModalOpen(false);
      setSelectedTransactionToModify(null);
      fetchData(); // Recharger les données

      setFormData({
        id: "",
        date: new Date().toISOString().substring(0, 10),
        description: "",
        montant: "",
        type: "Revenu",
        categorie: "",
        compte: "",
        numeroCheque: "",
      });

    } catch (error) {
      console.error("Erreur modification:", error);
      showToast("Erreur lors de la modification", "error");
    }
  };

  // --- Delete Logic

  const startDelete = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await api.delete(`/transactions/${transactionToDelete}`);
        showToast(`Transaction supprimée.`, "success"); // Changed to success type
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
        fetchData(); // Recharger les données
      } catch (error) {
        console.error("Erreur suppression:", error);
        showToast("Erreur lors de la suppression", "error");
      }
    }
  };

  // --- Add Logic

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showNumeroCheque && !formData.numeroCheque) {
      showToast(
        "Le numéro de chèque est obligatoire pour un paiement par banque",
        "warning"
      );
      return;
    }

    if (montantNumber <= 0) {
      showToast("Le montant doit être supérieur à zéro", "warning");
      return;
    }

    try {
      // Trouver les IDs correspondants aux noms
      const cat = categoriesData.find(c => c.nom === formData.categorie);
      const acc = accountsData.find(a => a.nom === formData.compte);

      if (!cat || !acc) {
        showToast("Catégorie ou compte invalide", "error");
        return;
      }

      await api.post('/transactions', {
        categorieId: parseInt(cat.id),
        compteId: acc.id,
        dateTransaction: formData.date,
        description: formData.description,
        montant: parseFloat(formData.montant),
        type: formData.type === 'Revenu' ? 'RECETTE' : 'DEPENSE'
      });

      showToast("Transaction ajoutée avec succès", "success");
      setIsAddModalOpen(false);
      fetchData(); // Recharger les données

      setFormData({
        id: "",
        date: new Date().toISOString().substring(0, 10),
        description: "",
        montant: "",
        type: "Revenu",
        categorie: "",
        compte: "",
        numeroCheque: "",
      });

    } catch (error) {
      console.error("Erreur ajout:", error);
      showToast("Erreur lors de l'ajout", "error");
    }
  };

  if (isLoading || (loadingData && transactions.length === 0)) {
    return <LoadingScreen />;
  }

  return (
    <div>
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
              className="cursor-pointer bg-transparent text-sm outline-none"
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
              className="cursor-pointer bg-transparent text-sm outline-none"
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
              value={filterCompte}
              onChange={(e) => setFilterCompte(e.target.value)}
              className="cursor-pointer bg-transparent text-sm outline-none"
            >
              <option value="">Tous les comptes</option>
              {accountsData.map((acc) => (
                <option key={acc.id} value={acc.nom}>{acc.nom}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
            <MenuIcon />
            <select
              value={filterCategorie}
              onChange={(e) => setFilterCategorie(e.target.value)}
              className="cursor-pointer bg-transparent text-sm outline-none"
            >
              <option value="">Toutes les catégories</option>
              {categoriesData.map((cat) => (
                <option key={cat.id} value={cat.nom}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
            <TagIcon />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as "" | "Revenu" | "Dépense")
              }
              className="cursor-pointer bg-transparent text-sm outline-none"
            >
              <option value="">Tous les types</option>
              <option value="Revenu">Recette</option>
              <option value="Dépense">Dépense</option>
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="ml-auto flex items-center gap-2 text-sm text-black/40 underline hover:text-black cursor-pointer"
          >
            <RefreshIcon />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Résumé des totaux */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div 
          id="total-card"
          className="flex items-center gap-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <CalculatorIcon />
          </div>
          <div>
            <p className="text-sm text-black/60">Total Filtré</p>
            <p
              className={`text-xl font-bold ${totalMontant >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
            >
              {totalMontant >= 0 ? "+" : ""}
              {formatCurrency(totalMontant)}
            </p>
          </div>
        </div>
        {/* Vous pouvez ajouter d'autres cartes de résumé ici */}
      </div>

      {/* Table des Transactions */}
      <div 
        id="transactions-table"
        className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-black/60">
              <tr>
                <th
                  className="cursor-pointer px-6 py-4 font-semibold transition hover:bg-zinc-100"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <SortIcon
                      field="date"
                      currentField={sortField}
                      order={sortOrder}
                    />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-6 py-4 font-semibold transition hover:bg-zinc-100"
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center gap-2">
                    Description
                    <SortIcon
                      field="description"
                      currentField={sortField}
                      order={sortOrder}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold">Catégorie</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Compte</th>
                <th
                  className="cursor-pointer px-6 py-4 text-right font-semibold transition hover:bg-zinc-100"
                  onClick={() => handleSort("montant")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Montant
                    <SortIcon
                      field="montant"
                      currentField={sortField}
                      order={sortOrder}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className="group transition hover:bg-zinc-50"
                  >
                    <td className="px-6 py-4 font-medium text-black/70">
                      {t.date}
                    </td>
                    <td className="px-6 py-4 font-medium">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-black/5 bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-black/70">
                        {t.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t.type === "Revenu"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                      >
                        {t.type === "Revenu" ? "Recette" : "Dépense"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-black/60">{t.compte}</td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${t.type === "Revenu"
                        ? "text-emerald-500"
                        : "text-red-500"
                        }`}
                    >
                      {t.montantAffiche}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-60 transition group-hover:opacity-100">
                        <button
                          onClick={() => startModify(t)}
                          className="rounded-full p-2 text-black/40 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Modifier"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => startDelete(t.id)}
                          className="rounded-full p-2 text-black/40 transition hover:bg-red-50 hover:text-red-600"
                          title="Supprimer"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-black/40">
                      <SearchIcon />
                      <p className="mt-2 text-sm">
                        Aucune transaction trouvée pour ces filtres.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/5 px-6 py-4">
            <p className="text-sm text-black/50">
              Affichage de {startIndex + 1} à{" "}
              {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}{" "}
              sur {filteredTransactions.length} transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-black/10 p-2 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                <ChevronLeftIcon />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition ${currentPage === page
                      ? "bg-black text-white"
                      : "text-black/60 hover:bg-zinc-50"
                      }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-black/10 p-2 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <TransactionForm
          title="Ajouter une Transaction"
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddTransaction}
          formData={formData}
          handleInputChange={handleInputChange}
          handleTypeChange={handleTypeChange}
          availableCategories={availableCategories}
          isCaisseDisabled={isCaisseDisabled}
          showNumeroCheque={showNumeroCheque}
          soldeCaisse={soldeCaisse}
          soldeBanque={soldeBanque}
          accounts={accountsData}
        />
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold">Sécurité</h3>
            <p className="mb-4 text-sm text-black/60">
              Veuillez entrer le mot de passe administrateur pour modifier cette
              transaction.
            </p>
            <form onSubmit={handleAuthSubmit}>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="mb-4 w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Mot de passe..."
                autoFocus
              />
              <div className="flex justify-end space-x-3">
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
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModifyModalOpen && (
        <TransactionForm
          title="Modifier la Transaction"
          onClose={() => setIsModifyModalOpen(false)}
          onSubmit={handleModifyTransaction}
          isModification={true}
          formData={formData}
          handleInputChange={handleInputChange}
          handleTypeChange={handleTypeChange}
          availableCategories={availableCategories}
          isCaisseDisabled={isCaisseDisabled}
          showNumeroCheque={showNumeroCheque}
          soldeCaisse={soldeCaisse}
          soldeBanque={soldeBanque}
          accounts={accountsData}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Supprimer la transaction ?"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette transaction de l'historique ?"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
}