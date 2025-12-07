"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/hooks/useLoading";
import { SearchIcon } from "@/components/Icons";
import { sousCategorieService, type SousCategorie } from "@/lib/api/sousCategorieService";
import { transactionService } from "@/lib/api/transactionService";
import { categorieService } from "@/lib/api/categorieService";
import { formatNumberWithSpaces } from "@/lib/helpers";

export default function AssociationPage() {
    const { showToast } = useToast();
    const isLoading = useLoading(1500);
    const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
    const [balances, setBalances] = useState<Record<number, number>>({});
    const [loadingData, setLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);

    // Trouver la catégorie "Fikambanana"
    useEffect(() => {
        const findCategory = async () => {
            try {
                setLoadingData(true);
                const categories = await categorieService.getAll();
                console.log('Catégories récupérées:', categories);
                
                // Chercher la catégorie par nom (insensible à la casse, plus flexible)
                // Chercher d'abord une correspondance exacte, puis partielle
                let category = categories.find(
                    (cat) => cat.nom.toLowerCase() === "fikambanana"
                );
                
                if (!category) {
                    // Chercher une correspondance partielle
                    category = categories.find(
                        (cat) => cat.nom.toLowerCase().includes("fikambanana")
                    );
                }
                
                if (category) {
                    console.log('Catégorie trouvée:', category);
                    setCategoryId(category.id);
                } else {
                    console.warn('Aucune catégorie Fikambanana trouvée. Catégories disponibles:', categories.map(c => c.nom));
                    showToast(`Catégorie 'Fikambanana' introuvable. Catégories disponibles: ${categories.map(c => c.nom).join(', ')}`, "warning");
                    setCategoryId(null);
                }
            } catch (error: any) {
                console.error("Erreur lors de la recherche de la catégorie:", error);
                const errorMessage = error?.message || error?.response?.data?.message || "Erreur lors de la recherche de la catégorie";
                showToast(errorMessage, "error");
                setCategoryId(null);
            } finally {
                setLoadingData(false);
            }
        };
        findCategory();
    }, [showToast]);

    // Charger les sous-catégories actives de la catégorie
    useEffect(() => {
        const loadSousCategories = async () => {
            if (!categoryId) return;

            try {
                setLoadingData(true);
                const data = await sousCategorieService.getAll({
                    categorieId: categoryId,
                    statut: "ACTIF",
                });
                setSousCategories(data);
            } catch (error) {
                console.error("Erreur lors du chargement des sous-catégories:", error);
                showToast("Erreur lors du chargement des sous-catégories", "error");
            } finally {
                setLoadingData(false);
            }
        };

        loadSousCategories();

        // Rafraîchir les sous-catégories toutes les 30 secondes pour détecter les nouvelles
        const interval = setInterval(() => {
            loadSousCategories();
        }, 30000);

        return () => clearInterval(interval);
    }, [categoryId, showToast]);

    // Calculer les soldes pour chaque sous-catégorie
    useEffect(() => {
        const calculateBalances = async () => {
            if (sousCategories.length === 0) return;

            try {
                const balancesMap: Record<number, number> = {};

                // Charger toutes les transactions pour calculer les soldes
                const transactions = await transactionService.getAll({ limit: 10000 });

                // Calculer le solde pour chaque sous-catégorie
                for (const sousCat of sousCategories) {
                    const sousCatTransactions = transactions.filter((tx) => {
                        // Vérifier par sousCategorieId ou par la relation sousCategorie
                        const txSousCatId = tx.sousCategorieId || tx.sousCategorie?.id;
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

        // Rafraîchir les données toutes les 30 secondes pour détecter les nouvelles transactions
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

    if (isLoading || (loadingData && sousCategories.length === 0)) {
        return <LoadingScreen />;
    }

    if (!categoryId) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-black/60">
                        Catégorie "Fikambanana" introuvable
                    </p>
                    <p className="mt-2 text-sm text-black/40">
                        Veuillez créer la catégorie "Fikambanana" dans les paramètres.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <header className="flex flex-wrap items-center justify-between gap-6">
                <div>
                    <p className="text-sm text-black/60">Gestion des Associations</p>
                    <h1 className="text-2xl font-semibold">Association</h1>
                </div>
                <div className="flex w-full max-w-sm items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Rechercher une association..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none"
                    />
                </div>
            </header>

            <section className="mt-10">
                {filteredSousCategories.length === 0 ? (
                    <div className="rounded-3xl border border-black/5 bg-white p-12 text-center shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
                        <p className="text-lg font-semibold text-black/60">
                            {searchTerm
                                ? "Aucune association trouvée"
                                : "Aucune association active"}
                        </p>
                        <p className="mt-2 text-sm text-black/40">
                            {searchTerm
                                ? "Essayez avec un autre terme de recherche"
                                : "Les associations apparaîtront ici une fois créées"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredSousCategories.map((sousCat) => {
                            const solde = balances[sousCat.id] || 0;
                            const isPositive = solde >= 0;

                            return (
                                <article
                                    key={sousCat.id}
                                    className="group cursor-pointer rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                                >
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-black">
                                            {sousCat.nom}
                                        </h3>
                                    </div>
                                    <div className="mt-4 border-t border-black/5 pt-4">
                                        <p className="text-xs text-black/50">Solde</p>
                                        <p
                                            className={`mt-2 text-2xl font-bold ${
                                                isPositive ? "text-emerald-600" : "text-red-600"
                                            }`}
                                        >
                                            {isPositive ? "+" : ""}
                                            {formatNumberWithSpaces(Math.abs(solde))} Ar
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

