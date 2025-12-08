"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/hooks/useLoading";
import { SearchIcon, EyeIcon, RefreshIcon } from "@/components/Icons";
import { sousCategorieService, type SousCategorie } from "@/lib/api/sousCategorieService";
import { transactionService } from "@/lib/api/transactionService";
import { categorieService } from "@/lib/api/categorieService";
import { formatNumberWithSpaces, formatDate } from "@/lib/helpers";
import type { Transaction } from "@/lib/types";

export default function AssociationPage() {
    const { showToast } = useToast();
    const isLoading = useLoading(1500);
    const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
    const [groupedSousCategories, setGroupedSousCategories] = useState<Array<{nom: string, ids: number[]}>>([]);
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [loadingData, setLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryIds, setCategoryIds] = useState<number[]>([]);
    const [selectedSousCategorieName, setSelectedSousCategorieName] = useState<string | null>(null);
    const [transactionsModal, setTransactionsModal] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fonction pour générer une couleur pastel basée sur le nom (cohérente)
    const getPastelColor = (name: string) => {
        // Générer un hash simple à partir du nom pour avoir une couleur cohérente
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Générer des couleurs pastel (HSL avec saturation et luminosité élevées)
        const hue = Math.abs(hash) % 360;
        const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
        const lightness = 85 + (Math.abs(hash) % 10); // 85-95%
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    // Trouver toutes les catégories "Fikambanana" (Recette et Dépense)
    useEffect(() => {
        const findCategories = async () => {
            try {
                setLoadingData(true);
                const categories = await categorieService.getAll();
                console.log('Catégories récupérées:', categories);
                
                // Chercher toutes les catégories Fikambanana (peu importe le type)
                const fikambananaCategories = categories.filter(
                    (cat) => cat.nom.toLowerCase().includes("fikambanana")
                );
                
                if (fikambananaCategories.length > 0) {
                    console.log('Catégories Fikambanana trouvées:', fikambananaCategories);
                    setCategoryIds(fikambananaCategories.map(c => c.id));
                } else {
                    console.warn('Aucune catégorie Fikambanana trouvée. Catégories disponibles:', categories.map(c => c.nom));
                    showToast(`Catégorie 'Fikambanana' introuvable. Catégories disponibles: ${categories.map(c => c.nom).join(', ')}`, "warning");
                    setCategoryIds([]);
                }
            } catch (error: any) {
                console.error("Erreur lors de la recherche de la catégorie:", error);
                const errorMessage = error?.message || error?.response?.data?.message || "Erreur lors de la recherche de la catégorie";
                showToast(errorMessage, "error");
                setCategoryIds([]);
            } finally {
                setLoadingData(false);
            }
        };
        findCategories();
    }, [showToast]);

    // Charger les sous-catégories actives de toutes les catégories Fikambanana et les grouper par nom
    useEffect(() => {
        const loadSousCategories = async () => {
            if (categoryIds.length === 0) return;

            try {
                setLoadingData(true);
                // Charger les sous-catégories de toutes les catégories Fikambanana
                const allSousCategories: SousCategorie[] = [];
                for (const catId of categoryIds) {
                    const data = await sousCategorieService.getAll({
                        categorieId: catId,
                        statut: "ACTIF",
                    });
                    allSousCategories.push(...data);
                }
                
                setSousCategories(allSousCategories);
                
                // Grouper les sous-catégories par nom (normalisé, insensible à la casse)
                const grouped = new Map<string, number[]>();
                for (const sousCat of allSousCategories) {
                    const normalizedName = sousCat.nom.toLowerCase().trim();
                    if (!grouped.has(normalizedName)) {
                        grouped.set(normalizedName, []);
                    }
                    grouped.get(normalizedName)!.push(sousCat.id);
                }
                
                // Convertir en tableau pour l'affichage
                const groupedArray = Array.from(grouped.entries()).map(([nom, ids]) => ({
                    nom: allSousCategories.find(sc => sc.id === ids[0])?.nom || nom, // Utiliser le nom original du premier
                    ids
                }));
                
                setGroupedSousCategories(groupedArray);
            } catch (error) {
                console.error("Erreur lors du chargement des sous-catégories:", error);
                showToast("Erreur lors du chargement des sous-catégories", "error");
            } finally {
                setLoadingData(false);
            }
        };

        loadSousCategories();

        // Écouter les événements de mise à jour
        const handleTransactionUpdate = () => {
            loadSousCategories();
        };
        const handleSousCategorieUpdate = () => {
            loadSousCategories();
        };

        // Rafraîchir quand la fenêtre reprend le focus
        const handleFocus = () => {
            loadSousCategories();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('transaction-updated', handleTransactionUpdate);
            window.addEventListener('sous-categorie-updated', handleSousCategorieUpdate);
            window.addEventListener('focus', handleFocus);
        }

        // Rafraîchir les sous-catégories toutes les 5 secondes pour un temps réel
        // Mais seulement si la page est visible
        const interval = setInterval(() => {
            if (!document.hidden) {
                loadSousCategories();
            }
        }, 5000);
        
        // Rafraîchir immédiatement quand la page redevient visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadSousCategories();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (typeof window !== 'undefined') {
                window.removeEventListener('transaction-updated', handleTransactionUpdate);
                window.removeEventListener('sous-categorie-updated', handleSousCategorieUpdate);
                window.removeEventListener('focus', handleFocus);
            }
        };
    }, [categoryIds, showToast]);

    // Calculer les soldes pour chaque groupe de sous-catégories (par nom)
    useEffect(() => {
        const calculateBalances = async () => {
            if (groupedSousCategories.length === 0) return;

            try {
                const balancesMap: Record<string, number> = {};

                // Charger toutes les transactions pour calculer les soldes
                const transactions = await transactionService.getAll({ limit: 10000 });

                // Calculer le solde pour chaque groupe de sous-catégories (même nom)
                for (const group of groupedSousCategories) {
                    const normalizedName = group.nom.toLowerCase().trim();
                    let solde = 0;

                    // Parcourir toutes les transactions et vérifier si elles appartiennent à ce groupe
                    for (const tx of transactions) {
                        // Vérifier par sousCategorieId ou par la relation sousCategorie
                        const txSousCatId = tx.sousCategorieId || tx.sousCategorie?.id;
                        
                        // Vérifier aussi si la transaction a plusieurs sous-catégories dans la description
                        let belongsToGroup = false;
                        if (txSousCatId && group.ids.includes(txSousCatId)) {
                            belongsToGroup = true;
                        } else if (tx.description) {
                            // Gérer le cas où plusieurs sous-catégories sont dans la description
                            // Format: (SC:1,2,3) dans la description
                            const scMatch = tx.description.match(/\(SC:([^)]+)\)/);
                            if (scMatch) {
                                const scIds = scMatch[1].split(',').map(id => parseInt(id.trim()));
                                belongsToGroup = scIds.some(id => group.ids.includes(id));
                            }
                        }

                        if (belongsToGroup) {
                            const montant = parseFloat(tx.montant.toString());
                            // RECETTE = +, DEPENSE = -
                            solde += tx.type === "RECETTE" ? montant : -montant;
                        }
                    }

                    balancesMap[normalizedName] = solde;
                }

                setBalances(balancesMap);
            } catch (error) {
                console.error("Erreur lors du calcul des soldes:", error);
            }
        };

        calculateBalances();

        // Écouter les événements de mise à jour
        const handleTransactionUpdate = () => {
            calculateBalances();
        };

        // Rafraîchir quand la fenêtre reprend le focus
        const handleFocus = () => {
            calculateBalances();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('transaction-updated', handleTransactionUpdate);
            window.addEventListener('focus', handleFocus);
        }

        // Rafraîchir les données toutes les 5 secondes pour un temps réel
        // Mais seulement si la page est visible
        const interval = setInterval(() => {
            if (!document.hidden) {
                calculateBalances();
            }
        }, 5000);
        
        // Rafraîchir immédiatement quand la page redevient visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                calculateBalances();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (typeof window !== 'undefined') {
                window.removeEventListener('transaction-updated', handleTransactionUpdate);
                window.removeEventListener('focus', handleFocus);
            }
        };
    }, [groupedSousCategories]);

    // Fonction de rafraîchissement manuel
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Recharger les catégories
            const categories = await categorieService.getAll();
            const fikambananaCategories = categories.filter(
                (cat) => cat.nom.toLowerCase().includes("fikambanana")
            );
            if (fikambananaCategories.length > 0) {
                setCategoryIds(fikambananaCategories.map(c => c.id));
            }
            
            // Les useEffect se déclencheront automatiquement pour recharger les données
            showToast("Données rafraîchies avec succès", "success");
        } catch (error) {
            console.error("Erreur lors du rafraîchissement:", error);
            showToast("Erreur lors du rafraîchissement", "error");
        } finally {
            setIsRefreshing(false);
        }
    };

    // Filtrer les groupes de sous-catégories selon la recherche
    const filteredSousCategories = useMemo(() => {
        if (!searchTerm) return groupedSousCategories;

        return groupedSousCategories.filter((group) =>
            group.nom.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [groupedSousCategories, searchTerm]);

    // Fonction pour charger les transactions d'un groupe
    const loadGroupTransactions = async (group: {nom: string, ids: number[]}, showLoading = false) => {
        if (showLoading) {
            setLoadingTransactions(true);
        }
        try {
            const allTransactions = await transactionService.getAll({ limit: 10000 });
            const groupTransactions = allTransactions
                .filter((tx) => {
                    const txSousCatId = tx.sousCategorieId || tx.sousCategorie?.id;
                    
                    // Vérifier si la transaction appartient à ce groupe
                    if (txSousCatId && group.ids.includes(txSousCatId)) {
                        return true;
                    }
                    
                    // Vérifier aussi si la transaction a plusieurs sous-catégories dans la description
                    if (tx.description) {
                        const scMatch = tx.description.match(/\(SC:([^)]+)\)/);
                        if (scMatch) {
                            const scIds = scMatch[1].split(',').map(id => parseInt(id.trim()));
                            return scIds.some(id => group.ids.includes(id));
                        }
                    }
                    
                    return false;
                })
                .sort((a, b) => {
                    const dateA = new Date(a.dateTransaction).getTime();
                    const dateB = new Date(b.dateTransaction).getTime();
                    return dateB - dateA; // Plus récent en premier
                })
                .slice(0, 3); // Prendre les 3 dernières
            setTransactionsModal(groupTransactions);
        } catch (error) {
            console.error("Erreur lors du chargement des transactions:", error);
            showToast("Erreur lors du chargement des transactions", "error");
        } finally {
            if (showLoading) {
                setLoadingTransactions(false);
            }
        }
    };

    // Charger les 3 dernières transactions d'un groupe de sous-catégories
    const handleViewTransactions = async (group: {nom: string, ids: number[]}) => {
        setSelectedSousCategorieName(group.nom);
        await loadGroupTransactions(group, true);
    };

    // Rafraîchir les transactions du modal en temps réel quand il est ouvert
    useEffect(() => {
        if (!selectedSousCategorieName) return;

        // Trouver le groupe correspondant
        const group = groupedSousCategories.find(g => g.nom === selectedSousCategorieName);
        if (!group) return;

        // Écouter les événements de mise à jour
        const handleTransactionUpdate = () => {
            loadGroupTransactions(group, false);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('transaction-updated', handleTransactionUpdate);
        }

        // Rafraîchir toutes les 5 secondes si le modal est ouvert
        const interval = setInterval(() => {
            if (!document.hidden) {
                loadGroupTransactions(group, false);
            }
        }, 5000);

        // Rafraîchir immédiatement quand la page redevient visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadGroupTransactions(group, false);
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (typeof window !== 'undefined') {
                window.removeEventListener('transaction-updated', handleTransactionUpdate);
            }
        };
    }, [selectedSousCategorieName, groupedSousCategories]);

    if (isLoading || (loadingData && groupedSousCategories.length === 0 && categoryIds.length > 0)) {
        return <LoadingScreen />;
    }

    if (categoryIds.length === 0) {
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
                <div className="flex items-center gap-3">
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
                    {/* <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 rounded-full border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Rafraîchir les données"
                    >
                        <RefreshIcon />
                        <span>{isRefreshing ? "Rafraîchissement..." : "Rafraîchir"}</span>
                    </button> */}
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
                        {filteredSousCategories.map((group) => {
                            const normalizedName = group.nom.toLowerCase().trim();
                            const solde = balances[normalizedName] || 0;
                            const isPositive = solde >= 0;
                            const pastelColor = getPastelColor(group.nom);

                            return (
                                <article
                                    key={normalizedName}
                                    className="group relative rounded-3xl border border-black/5 p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                                    style={{
                                        backgroundColor: pastelColor,
                                    }}
                                >
                                    <button
                                        onClick={() => handleViewTransactions(group)}
                                        className="absolute top-4 right-4 rounded-full p-2 text-black/40 transition hover:bg-black/10 hover:text-blue-600"
                                        title="Voir les dernières transactions"
                                    >
                                        <EyeIcon />
                                    </button>
                                    <div className="mb-4 pr-8">
                                        <h3 className="text-lg font-semibold text-black">
                                            {group.nom}
                                        </h3>
                                    </div>
                                    <div className="mt-4 border-t border-black/10 pt-4">
                                        <p className="text-xs text-black/60 font-medium">Solde</p>
                                        <p
                                            className={`mt-2 text-2xl font-bold ${
                                                isPositive ? "text-emerald-700" : "text-red-700"
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

            {/* Modal pour afficher les transactions */}
            {selectedSousCategorieName && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Dernières transactions - {selectedSousCategorieName}
                            </h2>
                            <button
                                onClick={() => {
                                    setSelectedSousCategorieName(null);
                                    setTransactionsModal([]);
                                }}
                                className="rounded-lg p-2 text-black/40 transition hover:bg-black/5 hover:text-black"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {loadingTransactions ? (
                            <div className="py-8 text-center text-black/50">
                                Chargement...
                            </div>
                        ) : transactionsModal.length === 0 ? (
                            <div className="py-8 text-center text-black/50">
                                Aucune transaction pour cette association
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactionsModal.map((tx) => {
                                    const isRecette = tx.type === "RECETTE";
                                    return (
                                        <div
                                            key={tx.id}
                                            className="rounded-xl border border-black/5 bg-zinc-50 p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-black">
                                                        {tx.description || "Sans description"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-black/50">
                                                        {formatDate(tx.dateTransaction)}
                                                    </p>
                                                </div>
                                                <p
                                                    className={`ml-4 text-sm font-semibold ${
                                                        isRecette
                                                            ? "text-emerald-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {isRecette ? "+" : "-"}
                                                    {formatNumberWithSpaces(Math.abs(parseFloat(tx.montant.toString())))} Ar
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

