"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { compteSecretaireService } from "@/lib/api/compteSecretaireService";
import { compteService } from "@/lib/api/compteService";
import { apiCache } from "@/lib/api/cache";
import { PlusIcon, RefreshIcon } from "@/components/Icons";
import type { Compte } from "@/lib/types";

type CompteSecretaire = Compte & {
    usersSecretaires?: Array<{
        id: number;
        email: string;
        nom: string;
        role: string;
    }>;
};

export default function ComptesSecretairesPage() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [comptes, setComptes] = useState<CompteSecretaire[]>([]);
    const [comptesSource, setComptesSource] = useState<Compte[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAlimenterModalOpen, setIsAlimenterModalOpen] = useState(false);
    const [selectedCompte, setSelectedCompte] = useState<CompteSecretaire | null>(null);
    
    const [createForm, setCreateForm] = useState({
        email: "",
        motDePasse: "",
        nom: "",
        nomCompte: "",
    });
    
    const [alimenterForm, setAlimenterForm] = useState({
        montant: "",
        compteSourceId: "",
        description: "",
    });

    useEffect(() => {
        if (user?.role !== 'ADMIN' && user?.role) {
            showToast("Accès refusé. Seuls les administrateurs peuvent accéder à cette page.", "error");
            return;
        }
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [comptesData, comptesSourceData] = await Promise.all([
                compteSecretaireService.getAll(),
                compteService.getAll({ type: undefined }),
            ]);
            setComptes(comptesData || []);
            // Filtrer pour exclure les comptes secrétaires des comptes source
            setComptesSource((comptesSourceData || []).filter(c => c.type !== 'SECRETAIRE'));
        } catch (error: any) {
            console.error("Erreur détaillée:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Erreur lors du chargement des données";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            if (!createForm.email || !createForm.motDePasse || !createForm.nom || !createForm.nomCompte) {
                showToast("Tous les champs sont requis", "warning");
                return;
            }

            await compteSecretaireService.create({
                email: createForm.email,
                motDePasse: createForm.motDePasse,
                nom: createForm.nom,
                nomCompte: createForm.nomCompte,
            });

            showToast("Compte secrétaire créé avec succès", "success");
            setIsCreateModalOpen(false);
            setCreateForm({ email: "", motDePasse: "", nom: "", nomCompte: "" });
            loadData();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Erreur lors de la création", "error");
        }
    };

    const handleAlimenter = async () => {
        try {
            if (!alimenterForm.montant || !alimenterForm.compteSourceId) {
                showToast("Le montant et le compte source sont requis", "warning");
                return;
            }

            const montant = parseFloat(alimenterForm.montant);
            if (montant <= 0) {
                showToast("Le montant doit être positif", "warning");
                return;
            }

            if (!selectedCompte) {
                showToast("Aucun compte sélectionné", "error");
                return;
            }

            await compteSecretaireService.alimenter(selectedCompte.id, {
                montant,
                compteSourceId: parseInt(alimenterForm.compteSourceId),
                description: alimenterForm.description,
            });

            // Invalider le cache pour forcer le rafraîchissement des données
            // Les clés de cache sont au format: METHOD_URL_JSON.stringify(params)
            // Le pattern regex matche toutes les clés qui commencent par ces préfixes
            apiCache.invalidatePattern('GET_/comptes');
            apiCache.invalidatePattern('GET_/comptes-secretaires');
            apiCache.invalidatePattern('GET_/transactions');
            apiCache.invalidatePattern('GET_/transactions/stats');

            // Déclencher les événements pour rafraîchir le dashboard automatiquement
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('transaction-updated'));
                window.dispatchEvent(new Event('compte-updated'));
            }

            showToast("Compte alimenté avec succès", "success");
            setIsAlimenterModalOpen(false);
            setAlimenterForm({ montant: "", compteSourceId: "", description: "" });
            setSelectedCompte(null);
            
            // Recharger les données pour mettre à jour les soldes en temps réel
            await loadData();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Erreur lors de l'alimentation", "error");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-MG", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (user?.role !== 'ADMIN' && user?.role) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
                    <p className="mt-2 text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Gestion des Comptes Secrétaires</h1>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-300"
                    >
                        <RefreshIcon />
                        Actualiser
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                    >
                        <PlusIcon />
                        Créer un compte secrétaire
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {comptes.map((compte) => (
                    <div
                        key={compte.id}
                        className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">{compte.nom}</h3>
                            {compte.usersSecretaires && compte.usersSecretaires.length > 0 && (
                                <p className="text-sm text-gray-600">
                                    {compte.usersSecretaires[0].nom} ({compte.usersSecretaires[0].email})
                                </p>
                            )}
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Solde actuel</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(parseFloat(compte.soldeActuel.toString()))} Ar
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedCompte(compte);
                                setIsAlimenterModalOpen(true);
                            }}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            Alimenter le compte
                        </button>
                    </div>
                ))}
            </div>

            {comptes.length === 0 && (
                <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
                    <p className="text-gray-600">Aucun compte secrétaire créé pour le moment.</p>
                </div>
            )}

            {/* Modal Création */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold">Créer un compte secrétaire</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, email: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={createForm.motDePasse}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, motDePasse: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom complet
                                </label>
                                <input
                                    type="text"
                                    value={createForm.nom}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, nom: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom du compte
                                </label>
                                <input
                                    type="text"
                                    value={createForm.nomCompte}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, nomCompte: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setCreateForm({ email: "", motDePasse: "", nom: "", nomCompte: "" });
                                }}
                                className="flex-1 rounded-lg bg-zinc-200 px-4 py-2 font-medium transition hover:bg-zinc-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-zinc-800"
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Alimentation */}
            {isAlimenterModalOpen && selectedCompte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold">
                            Alimenter le compte: {selectedCompte.nom}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Compte source
                                </label>
                                <select
                                    value={alimenterForm.compteSourceId}
                                    onChange={(e) =>
                                        setAlimenterForm({ ...alimenterForm, compteSourceId: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                >
                                    <option value="">Sélectionner un compte</option>
                                    {comptesSource.map((compte) => (
                                        <option key={compte.id} value={compte.id}>
                                            {compte.nom} ({formatCurrency(parseFloat(compte.soldeActuel.toString()))} Ar)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Montant (Ar)
                                </label>
                                <input
                                    type="number"
                                    value={alimenterForm.montant}
                                    onChange={(e) =>
                                        setAlimenterForm({ ...alimenterForm, montant: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description (optionnel)
                                </label>
                                <textarea
                                    value={alimenterForm.description}
                                    onChange={(e) =>
                                        setAlimenterForm({ ...alimenterForm, description: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setIsAlimenterModalOpen(false);
                                    setAlimenterForm({ montant: "", compteSourceId: "", description: "" });
                                    setSelectedCompte(null);
                                }}
                                className="flex-1 rounded-lg bg-zinc-200 px-4 py-2 font-medium transition hover:bg-zinc-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAlimenter}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                            >
                                Alimenter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
