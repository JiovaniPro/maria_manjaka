"use client";

import React, { useState, useRef, useEffect } from "react";
import { CloseIcon } from "@/components/Icons";
import { formatNumberWithSpaces, removeNumberSpaces } from "@/lib/helpers";

type Category = {
    id: string;
    nom: string;
    type: "Revenu" | "Dépense";
    statut: "actif" | "inactif";
};

type SousCategorie = {
    id: number;
    nom: string;
    categorieId: number;
    statut: "ACTIF" | "INACTIF";
};

type Account = {
    id: number;
    nom: string;
    solde: number;
};

type TransactionFormProps = {
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    onClose: () => void;
    isModification?: boolean;
    formData: any;
    handleInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    handleSousCategorieChange?: (selectedIds: string[]) => void;
    handleTypeChange: (newType: "Revenu" | "Dépense") => void;
    availableCategories: Category[];
    sousCategories?: SousCategorie[];
    accounts: Account[];
    isCaisseDisabled: boolean;
    showNumeroCheque: boolean;
    soldeCaisse: number;
    soldeBanque: number;
    lockCompte?: boolean;
    lockedCompteName?: string;
    showFacturePrompt?: boolean;
    needsAdminPassword?: boolean;
    chequeExists?: boolean;
    chequeChecking?: boolean;
    submitDisabled?: boolean;
};

export function TransactionForm({
    onSubmit,
    title,
    onClose,
    isModification = false,
    formData,
    handleInputChange,
    handleSousCategorieChange,
    handleTypeChange,
    availableCategories,
    sousCategories = [],
    accounts,
    isCaisseDisabled,
    showNumeroCheque,
    soldeCaisse,
    soldeBanque,
    lockCompte = false,
    lockedCompteName,
    showFacturePrompt = false,
    needsAdminPassword = false,
    chequeExists = false,
    chequeChecking = false,
    submitDisabled = false,
}: TransactionFormProps) {
    const selectValue = lockCompte && lockedCompteName ? lockedCompteName : formData.compte;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Convertir formData.sousCategorie en tableau si c'est une string (pour compatibilité)
    const selectedSousCategorieIds = Array.isArray(formData.sousCategorie) 
        ? formData.sousCategorie 
        : formData.sousCategorie 
            ? [formData.sousCategorie] 
            : [];

    // Fermer le dropdown quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleSousCategorie = (sousCategorieId: string) => {
        const newSelected = selectedSousCategorieIds.includes(sousCategorieId)
            ? selectedSousCategorieIds.filter(id => id !== sousCategorieId)
            : [...selectedSousCategorieIds, sousCategorieId];
        
        if (handleSousCategorieChange) {
            handleSousCategorieChange(newSelected);
        }
    };

    const removeSousCategorie = (sousCategorieId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSelected = selectedSousCategorieIds.filter(id => id !== sousCategorieId);
        if (handleSousCategorieChange) {
            handleSousCategorieChange(newSelected);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
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
                                className={`flex-1 rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${formData.type === "Revenu"
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                    : "border-black/10 bg-zinc-50 text-black/70 hover:bg-zinc-100"
                                    }`}
                            >
                                Recette (Revenu)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange("Dépense")}
                                className={`flex-1 rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${formData.type === "Dépense"
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
                            <label className="mb-2 block text-sm font-semibold text-black">
                                Date
                            </label>
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
                            <label className="mb-2 block text-sm font-semibold text-black">
                                Montant (Ar)
                            </label>
                            <input
                                type="text"
                                name="montant"
                                value={formatNumberWithSpaces(formData.montant || "")}
                                onChange={(e) => {
                                    // Enlever les espaces avant de stocker
                                    const rawValue = removeNumberSpaces(e.target.value);
                                    // Créer un nouvel event avec la valeur sans espaces
                                    const syntheticEvent = {
                                        ...e,
                                        target: {
                                            ...e.target,
                                            name: e.target.name,
                                            value: rawValue,
                                        },
                                    };
                                    handleInputChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
                                }}
                                inputMode="numeric"
                                pattern="[0-9\s]*"
                                required
                                key="montant-input"
                                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Ex: 100 000"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-black">
                            Description <span className="text-black/40 text-xs">(optionnel)</span>
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Ex: Achat de fournitures, Offrande du mois..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Catégorie */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">
                                Catégorie
                            </label>
                            <select
                                name="categorie"
                                value={formData.categorie}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="" disabled>
                                    Sélectionner une catégorie
                                </option>
                                {availableCategories.map((cat) => (
                                    <option key={cat.id} value={cat.nom}>
                                        {cat.nom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sous-catégorie */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">
                                Sous-catégorie <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                {/* Dropdown Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    disabled={!formData.categorie || sousCategories.length === 0}
                                    className={`w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm text-left focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-100 flex items-center justify-between ${
                                        !formData.categorie || sousCategories.length === 0
                                            ? "text-black/40"
                                            : "text-black"
                                    }`}
                                >
                                    <span>
                                        {!formData.categorie 
                                            ? "Sélectionner d'abord une catégorie"
                                            : sousCategories.length === 0
                                            ? "Aucune sous-catégorie disponible"
                                            : selectedSousCategorieIds.length === 0
                                            ? "Sélectionner une ou plusieurs sous-catégories"
                                            : `${selectedSousCategorieIds.length} sous-catégorie(s) sélectionnée(s)`}
                                    </span>
                                    <svg
                                        className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && formData.categorie && sousCategories.length > 0 && (
                                    <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-black/10 bg-white shadow-lg">
                                        {sousCategories.map((sc) => {
                                            const isSelected = selectedSousCategorieIds.includes(sc.id.toString());
                                            return (
                                                <div
                                                    key={sc.id}
                                                    onClick={() => toggleSousCategorie(sc.id.toString())}
                                                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition ${
                                                        isSelected ? "bg-blue-100" : ""
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${
                                                            isSelected 
                                                                ? "bg-blue-500 border-blue-500" 
                                                                : "border-black/20"
                                                        }`}>
                                                            {isSelected && (
                                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="text-sm">{sc.nom}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Selected Chips */}
                                {selectedSousCategorieIds.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedSousCategorieIds.map((id) => {
                                            const sousCategorie = sousCategories.find(sc => sc.id.toString() === id);
                                            if (!sousCategorie) return null;
                                            return (
                                                <span
                                                    key={id}
                                                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 border border-blue-200"
                                                >
                                                    {sousCategorie.nom}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => removeSousCategorie(id, e)}
                                                        className="ml-1 rounded-full hover:bg-blue-200 p-0.5 transition flex items-center justify-center"
                                                        aria-label="Supprimer"
                                                    >
                                                        <svg 
                                                            viewBox="0 0 24 24" 
                                                            className="h-3 w-3" 
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            strokeWidth="2"
                                                        >
                                                            <path d="M18 6L6 18M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}

                                {formData.categorie && sousCategories.length === 0 && (
                                    <p className="mt-2 text-xs text-red-500">
                                        Aucune sous-catégorie disponible. Veuillez créer une sous-catégorie pour cette catégorie dans la page Catégories.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Compte */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">
                                {formData.type === "Dépense"
                                    ? "Compte à Débiter"
                                    : "Compte de Réception"}
                            </label>
                            <select
                                name="compte"
                                value={selectValue}
                                onChange={handleInputChange}
                                required
                                disabled={lockCompte}
                                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-100"
                            >
                                <option value="" disabled>
                                    Sélectionner un compte
                                </option>
                                {accounts.map((account) => {
                                    // Logic specific to Caisse check if needed, or just generic
                                    const isCaisse = account.nom.toLowerCase().includes('caisse');
                                    const isDisabled = isCaisse && isCaisseDisabled;

                                    return (
                                        <option
                                            key={account.id}
                                            value={account.nom}
                                            disabled={isDisabled}
                                            className={isDisabled ? "text-red-500" : ""}
                                        >
                                            {account.nom} ({account.solde} Ar)
                                            {isDisabled ? " (Solde insuffisant)" : ""}
                                        </option>
                                    );
                                })}
                            </select>
                            {lockCompte && (
                                <p className="mt-2 text-xs text-black/50">
                                    Compte verrouillé sur la caisse pour toutes les transactions.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Numéro de Chèque */}
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
                            {chequeChecking && (
                                <p className="mt-1 text-xs text-amber-600">Vérification du numéro de chèque...</p>
                            )}
                            {chequeExists && !chequeChecking && (
                                <p className="mt-1 text-xs text-red-600">Ce numéro de chèque existe déjà.</p>
                            )}
                        </div>
                    )}

                    {/* Facture et override admin */}
                    {showFacturePrompt && (
                        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-black">
                                    Numéro de facture (obligatoire au-delà de 20 000 Ar)
                                </label>
                                <input
                                    type="text"
                                    name="numeroFacture"
                                    value={formData.numeroFacture}
                                    onChange={handleInputChange}
                                    required={!needsAdminPassword}
                                    className="w-full rounded-xl border border-amber-300 bg-white p-3 text-sm focus:border-amber-500 focus:ring-amber-500"
                                    placeholder="Ex: FAC-2025-001"
                                />
                            </div>
                            {needsAdminPassword && (
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-black">
                                        Mot de passe admin si aucune facture
                                    </label>
                                    <input
                                        type="password"
                                        name="adminPasswordOverride"
                                        value={formData.adminPasswordOverride}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-red-300 bg-white p-3 text-sm focus:border-red-500 focus:ring-red-500"
                                        placeholder="Saisir le mot de passe pour valider sans facture"
                                    />
                                    <p className="mt-1 text-xs text-red-500">
                                        Facture manquante : autorisation administrateur requise.
                                    </p>
                                </div>
                            )}
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
                            disabled={submitDisabled}
                            className="rounded-2xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isModification
                                ? "Enregistrer les modifications"
                                : "Ajouter la Transaction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
