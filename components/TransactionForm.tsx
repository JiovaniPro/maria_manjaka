"use client";

import React from "react";
import { CloseIcon } from "@/components/Icons";

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

type TransactionFormProps = {
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    onClose: () => void;
    isModification?: boolean;
    formData: any;
    handleInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    handleTypeChange: (newType: "Revenu" | "Dépense") => void;
    availableCategories: Category[];
    accounts: Account[];
    isCaisseDisabled: boolean;
    showNumeroCheque: boolean;
    soldeCaisse: number;
    soldeBanque: number;
};

export function TransactionForm({
    onSubmit,
    title,
    onClose,
    isModification = false,
    formData,
    handleInputChange,
    handleTypeChange,
    availableCategories,
    accounts,
    isCaisseDisabled,
    showNumeroCheque,
    soldeCaisse,
    soldeBanque,
}: TransactionFormProps) {
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
                                type="number"
                                name="montant"
                                value={formData.montant}
                                onChange={handleInputChange}
                                min="1"
                                step="1"
                                required
                                key="montant-input"
                                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-black">
                            Description
                        </label>
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

                        {/* Compte */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-black">
                                {formData.type === "Dépense"
                                    ? "Compte à Débiter"
                                    : "Compte de Réception"}
                            </label>
                            <select
                                name="compte"
                                value={formData.compte}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
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
