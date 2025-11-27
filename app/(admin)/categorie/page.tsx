"use client";

import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/hooks/useLoading";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { ConfirmModal } from "@/components/ConfirmModal";
import api from "@/services/api";
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
  code: string; // codeBudgetaire in DB
  type: "Recette" | "Dépense";
  transactions: number; // Count from relation
  statut: "actif" | "inactif";
};

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

  const fetchCategories = async () => {
    try {
      setLoadingData(true);
      const response = await api.get('/categories');
      const data = response.data.data;

      const mappedCategories: Category[] = data.map((c: any) => ({
        id: c.id.toString(),
        nom: c.nom,
        code: c.codeBudgetaire,
        type: c.type === 'RECETTE' ? 'Recette' : 'Dépense',
        transactions: c._count?.transactions || 0,
        statut: c.statut === 'ACTIF' ? 'actif' : 'inactif'
      }));

      setCategories(mappedCategories);
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
      showToast("Erreur lors du chargement des catégories", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const statutFinal = formData.statut ? "ACTIF" : "INACTIF";
    const typeFinal = formData.type === "Recette" ? "RECETTE" : "DEPENSE";

    try {
      if (editingCategory) {
        // Modification
        await api.put(`/categories/${editingCategory.id}`, {
          nom: formData.nom,
          codeBudgetaire: formData.code,
          statut: statutFinal
        });
        showToast("Catégorie modifiée avec succès", "success");
      } else {
        // Ajout
        await api.post('/categories', {
          nom: formData.nom,
          codeBudgetaire: formData.code,
          type: typeFinal,
          statut: statutFinal
        });
        showToast("Catégorie créée avec succès", "success");
      }

      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      showToast("Erreur lors de l'enregistrement", "error");
    }
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteConfirm({ isOpen: true, category });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.category) {
      try {
        await api.delete(`/categories/${deleteConfirm.category.id}`);
        showToast(`Catégorie "${deleteConfirm.category.nom}" supprimée`, "success");
        fetchCategories();
      } catch (error) {
        console.error("Erreur suppression:", error);
        showToast("Erreur lors de la suppression", "error");
      } finally {
        setDeleteConfirm({ isOpen: false, category: null });
      }
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

  if (isLoading || (loadingData && categories.length === 0)) {
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