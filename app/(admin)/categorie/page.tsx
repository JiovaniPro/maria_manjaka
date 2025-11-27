"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/hooks/useLoading";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  DeleteIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/Icons";

// ====================================================================
// TYPES & CONSTANTES
// ====================================================================

// --- TYPES
type Category = {
  id: string;
  nom: string;
  code: string;
  type: "Recette" | "Dépense";
  transactions: number;
  statut: "actif" | "inactif";
};

// --- DONNÉES DE DÉPART (pour initialiser l'état)
const initialCategories: Category[] = [
  { id: "1", nom: "Dîme", code: "245", type: "Recette", transactions: 3100, statut: "actif" },
  { id: "2", nom: "Offrandes Cultes", code: "180", type: "Recette", transactions: 45, statut: "actif" },
  { id: "3", nom: "Vente de Livres", code: "160", type: "Recette", transactions: 0, statut: "inactif" },
  { id: "4", nom: "Dons", code: "200", type: "Recette", transactions: 125, statut: "actif" },
  { id: "5", nom: "Location de Salles", code: "175", type: "Recette", transactions: 8, statut: "actif" },
  { id: "6", nom: "Événements Spéciaux", code: "190", type: "Recette", transactions: 22, statut: "actif" },
  { id: "7", nom: "Contributions Missions", code: "210", type: "Recette", transactions: 67, statut: "actif" },
  { id: "8", nom: "Vente Articles Divers", code: "165", type: "Recette", transactions: 14, statut: "actif" },
  { id: "9", nom: "Offrandes Spéciales", code: "185", type: "Recette", transactions: 33, statut: "actif" },
  { id: "10", nom: "Loyer", code: "300", type: "Dépense", transactions: 12, statut: "actif" },
  { id: "11", nom: "Salaires", code: "310", type: "Dépense", transactions: 24, statut: "actif" },
  { id: "12", nom: "Électricité", code: "320", type: "Dépense", transactions: 12, statut: "actif" },
  { id: "13", nom: "Entretien", code: "330", type: "Dépense", transactions: 35, statut: "actif" },
  { id: "14", nom: "Événements Caritatifs", code: "340", type: "Dépense", transactions: 6, statut: "actif" },
  { id: "15", nom: "Fournitures Bureau", code: "350", type: "Dépense", transactions: 28, statut: "actif" },
  { id: "16", nom: "Transport", code: "360", type: "Dépense", transactions: 19, statut: "actif" },
  { id: "17", nom: "Communication", code: "370", type: "Dépense", transactions: 11, statut: "actif" },
  { id: "18", nom: "Eau", code: "325", type: "Dépense", transactions: 12, statut: "actif" },
];

// ====================================================================
// COMPOSANTS MODAL (EXTRAIT POUR CORRIGER LE BUG DE FOCUS)
// ====================================================================

function CategoryFormModal({
  editingCategory,
  formData,
  setFormData,
  handleSubmit,
  handleCloseModal,
}: {
  editingCategory: Category | null;
  formData: { nom: string; code: string; type: "Recette" | "Dépense"; statut: boolean; };
  setFormData: React.Dispatch<React.SetStateAction<{ nom: string; code: string; type: "Recette" | "Dépense"; statut: boolean; }>>;
  handleSubmit: (e: React.FormEvent) => void;
  handleCloseModal: () => void;
}) {
  return (
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
            className="rounded-lg p-2 cursor-pointer text-black/40 transition hover:bg-black/5 hover:text-black"
          >
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">
              Type de catégorie
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "Recette" | "Dépense" })}
              required
              disabled={!!editingCategory}
              className="w-full cursor-pointer rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20 disabled:bg-zinc-100 disabled:cursor-not-allowed"
            >
              <option value="Recette">Recette</option>
              <option value="Dépense">Dépense</option>
            </select>
          </div>
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
              // Correction: En externalisant le composant, l'input ne perd plus le focus.
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
              // Correction: L'input de code bénéficie également de la stabilité.
              className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
              placeholder="Ex: 245"
            />
          </div>
          <div>
            <label className="mb-3 block text-sm font-semibold text-black">
              Statut
            </label>
            <ToggleSwitch
              checked={formData.statut}
              onChange={(checked) => setFormData({ ...formData, statut: checked })}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/90"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 cursor-pointer rounded-2xl border border-black/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
            >
              Annuler
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

export default function CategoriesPage() {
  const { showToast } = useToast();
  const isLoading = useLoading(1200);

  // 1. Refactorisation: Utilisation de useState pour les données de l'API
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const [activeTab, setActiveTab] = useState<"revenues" | "depenses">("revenues");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  });
  const itemsPerPage = 8;
  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    type: "Recette" as "Recette" | "Dépense",
    statut: true,
  });

  // Utilisation de la variable d'état `categories`
  const currentCategories = categories.filter(cat =>
    activeTab === "revenues" ? cat.type === "Recette" : cat.type === "Dépense"
  );

  const filteredCategories = currentCategories.filter(cat =>
    cat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        nom: category.nom,
        code: category.code,
        type: category.type,
        statut: category.statut === "actif",
      });
    } else {
      setEditingCategory(null);
      setFormData({ nom: "", code: "", type: activeTab === "revenues" ? "Recette" : "Dépense", statut: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ nom: "", code: "", type: "Recette", statut: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const statutFinal = formData.statut ? "actif" : "inactif";

    // Logique d'ajout/modification qui met à jour l'état `categories`
    if (editingCategory) {
      // Modification
      const updatedCategory: Category = {
        ...editingCategory,
        nom: formData.nom,
        code: formData.code,
        statut: statutFinal,
        // Le type ne change pas car le select est désactivé
      };

      setCategories((prev) =>
        prev.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat))
      );
      showToast("Catégorie modifiée avec succès", "success");
    } else {
      // Ajout
      const newCategory: Category = {
        id: Date.now().toString(), // ID temporaire
        nom: formData.nom,
        code: formData.code,
        type: formData.type,
        transactions: 0,
        statut: statutFinal,
      };

      setCategories((prev) => [...prev, newCategory]);
      showToast("Catégorie créée avec succès", "success");
    }

    handleCloseModal();
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteConfirm({ isOpen: true, category });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.category) {
      // Logique de suppression qui met à jour l'état `categories`
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== deleteConfirm.category!.id)
      );

      showToast(`Catégorie "${deleteConfirm.category.nom}" supprimée`, "error");
      setDeleteConfirm({ isOpen: false, category: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, category: null });
  };

  const handleTabChange = (tab: "revenues" | "depenses") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
        <p className="mt-2 text-sm text-black/60">
          Organisez et classez les flux financiers
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2.5">
          <SearchIcon />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/40"
            placeholder="Rechercher par nom ou code..."
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/90"
        >
          <PlusIcon />
          <span>Ajouter une Catégorie</span>
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-black/10">
        <button
          onClick={() => handleTabChange("revenues")}
          className={`border-b-2 cursor-pointer px-4 py-3 text-sm font-semibold transition ${activeTab === "revenues"
              ? "border-black text-black"
              : "border-transparent text-black/40"
            }`}
        >
          Recettes
        </button>
        <button
          onClick={() => handleTabChange("depenses")}
          className={`border-b-2 cursor-pointer px-4 py-3 text-sm font-semibold transition ${activeTab === "depenses"
              ? "border-black text-black"
              : "border-transparent text-black/40"
            }`}
        >
          Dépenses
        </button>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
        <div className="border-b border-black/5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {activeTab === "revenues"
                ? "Catégories de Recettes"
                : "Catégories de Dépenses"}
            </h2>
            <span className="text-sm text-black/60">
              {filteredCategories.length} catégorie(s)
            </span>
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
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-black/5 transition hover:bg-zinc-50/50"
                >
                  <td className="px-6 py-4 text-sm font-medium">{category.nom}</td>
                  <td className="px-6 py-4 text-sm text-black/60">{category.code}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${category.statut === "actif"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                        }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${category.statut === "actif" ? "bg-emerald-500" : "bg-red-500"
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
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className="rounded-lg p-2 text-black/60 transition hover:bg-red-50 hover:text-red-600"
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

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 border-t border-black/5 px-6 py-4">
          <span className="text-sm text-black/60">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg p-2 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-lg p-2 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Modal d'ajout/modification (Utilise le composant extrait) */}
      {isModalOpen && (
        <CategoryFormModal
          editingCategory={editingCategory}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleCloseModal={handleCloseModal}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteConfirm.category?.nom}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
    </div>
  );
}