"use client";

import React, { useState, useEffect, useMemo } from "react";
import { sousCategorieService, type SousCategorie } from "@/lib/api/sousCategorieService";
import { transactionService } from "@/lib/api/transactionService";
import { categorieService } from "@/lib/api/categorieService";
import { formatNumberWithSpaces } from "@/lib/helpers";

export function FikambananaSection() {
    const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
    const [balances, setBalances] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);

    // Trouver la catégorie "fikambanana masina & voamiera"
    useEffect(() => {
        const findCategory = async () => {
            try {
                const categories = await categorieService.getAll();
                // Chercher la catégorie par nom (insensible à la casse et aux accents)
                const category = categories.find(
                    (cat) =>
                        cat.nom.toLowerCase().includes("fikambanana") &&
                        (cat.nom.toLowerCase().includes("masina") || cat.nom.toLowerCase().includes("voamiera"))
                );
                if (category) {
                    setCategoryId(category.id);
                }
            } catch (error) {
                console.error("Erreur lors de la recherche de la catégorie:", error);
            }
        };
        findCategory();
    }, []);

    // Charger les sous-catégories actives de la catégorie
    useEffect(() => {
        const loadSousCategories = async () => {
            if (!categoryId) return;

            try {
                setLoading(true);
                const data = await sousCategorieService.getAll({
                    categorieId,
                    statut: "ACTIF",
                });
                setSousCategories(data);
            } catch (error) {
                console.error("Erreur lors du chargement des sous-catégories:", error);
            } finally {
                setLoading(false);
            }
        };

        loadSousCategories();

        // Rafraîchir les sous-catégories toutes les 30 secondes pour détecter les nouvelles
        const interval = setInterval(() => {
            loadSousCategories();
        }, 30000);

        return () => clearInterval(interval);
    }, [categoryId]);

    // Calculer les soldes pour chaque sous-catégorie
    useEffect(() => {
        const calculateBalances = async () => {
            if (sousCategories.length === 0) return;

            try {
                const balancesMap: Record<number, number> = {};

                // Charger toutes les transactions pour calculer les soldes
                // Utiliser une limite élevée pour obtenir toutes les transactions
                const transactions = await transactionService.getAll({ limit: 10000 });

                // Calculer le solde pour chaque sous-catégorie
                for (const sousCat of sousCategories) {
                    const sousCatTransactions = transactions.filter((tx) => {
                        // Vérifier par sousCategorieId ou par la relation sousCategorie
                        const txSousCatId = (tx as any).sousCategorieId || (tx as any).sousCategorie?.id;
                        
                        // Gérer aussi le cas où plusieurs sous-catégories sont dans la description
                        // Format: (SC:1,2,3) dans la description
                        if (!txSousCatId && tx.description) {
                            const scMatch = tx.description.match(/\(SC:([^)]+)\)/);
                            if (scMatch) {
                                const scIds = scMatch[1].split(',').map(id => parseInt(id.trim()));
                                return scIds.includes(sousCat.id);
                            }
                        }
                        
                        return txSousCatId === sousCat.id;
                    });

                    const solde = sousCatTransactions.reduce((sum, tx) => {
                        const montant = parseFloat(tx.montant.toString());
                        // RECETTE = +, DEPENSE = -
                        return tx.type === "RECETTE" ? sum + montant : sum - montant;
                    }, 0);

                    balancesMap[sousCat.id] = solde;
                }

                setBalances(balancesMap);
            } catch (error) {
                console.error("Erreur lors du calcul des soldes:", error);
            }
        };

        calculateBalances();

        // Rafraîchir les données toutes les 30 secondes pour détecter les nouvelles sous-catégories
        const interval = setInterval(() => {
            calculateBalances();
        }, 30000);

        return () => clearInterval(interval);
    }, [sousCategories]);

    // Filtrer les sous-catégories selon la recherche
    const filteredSousCategories = useMemo(() => {
        if (!searchTerm) return sousCategories;

        return sousCategories.filter((sc) =>
            sc.nom.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sousCategories, searchTerm]);

    if (!categoryId) {
        return null; // Ne pas afficher si la catégorie n'existe pas
    }

    if (loading) {
        return (
            <div className="space-y-4 border-t border-white/10 pt-6">
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                    Fikambanana Masina & Voamiera
                </p>
                <div className="text-sm text-white/50">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4 border-t border-white/10 pt-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                Fikambanana Masina & Voamiera
            </p>

            {/* Barre de recherche */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
            </div>

            {/* Liste des sous-catégories */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredSousCategories.length === 0 ? (
                    <div className="text-sm text-white/50 text-center py-4">
                        {searchTerm
                            ? "Aucune sous-catégorie trouvée"
                            : "Aucune sous-catégorie active"}
                    </div>
                ) : (
                    filteredSousCategories.map((sousCat) => {
                        const solde = balances[sousCat.id] || 0;
                        const isPositive = solde >= 0;

                        return (
                            <div
                                key={sousCat.id}
                                className="rounded-lg bg-white/10 p-3 hover:bg-white/15 transition"
                            >
                                <div className="text-sm font-medium text-white mb-1">
                                    {sousCat.nom}
                                </div>
                                <div
                                    className={`text-xs font-semibold ${
                                        isPositive ? "text-green-400" : "text-red-400"
                                    }`}
                                >
                                    {isPositive ? "+" : ""}
                                    {formatNumberWithSpaces(Math.abs(solde))} Ar
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

