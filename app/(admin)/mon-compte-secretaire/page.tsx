"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { compteSecretaireService } from "@/lib/api/compteSecretaireService";
import { compteService } from "@/lib/api/compteService";
import type { Compte } from "@/lib/types";

export default function MonCompteSecretairePage() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [monCompte, setMonCompte] = useState<Compte | null>(null);
    const [comptesDestination, setComptesDestination] = useState<Compte[]>([]);
    const [isTransfertModalOpen, setIsTransfertModalOpen] = useState(false);
    
    const [transfertForm, setTransfertForm] = useState({
        compteDestinationId: "",
        description: "",
    });

    useEffect(() => {
        if (user?.role !== 'SECRETAIRE') {
            showToast("Accès refusé. Cette page est réservée aux secrétaires.", "error");
            return;
        }
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [compteData, comptesData] = await Promise.all([
                compteSecretaireService.getMonCompte(),
                compteService.getAll({ type: undefined }),
            ]);
            setMonCompte(compteData);
            // Filtrer pour exclure les comptes secrétaires des comptes destination
            setComptesDestination(comptesData.filter(c => c.type !== 'SECRETAIRE'));
        } catch (error: any) {
            showToast("Erreur lors du chargement des données", "error");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransfert = async () => {
        try {
            if (!transfertForm.compteDestinationId) {
                showToast("Le compte destination est requis", "warning");
                return;
            }

            if (!monCompte) {
                showToast("Aucun compte trouvé", "error");
                return;
            }

            const soldeActuel = parseFloat(monCompte.soldeActuel.toString());
            if (soldeActuel <= 0) {
                showToast("Aucun solde à transférer", "warning");
                return;
            }

            await compteSecretaireService.transfererReste(monCompte.id, {
                compteDestinationId: parseInt(transfertForm.compteDestinationId),
                description: transfertForm.description,
            });

            showToast("Reste transféré avec succès", "success");
            setIsTransfertModalOpen(false);
            setTransfertForm({ compteDestinationId: "", description: "" });
            loadData();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Erreur lors du transfert", "error");
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

    if (user?.role !== 'SECRETAIRE') {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
                    <p className="mt-2 text-gray-600">Cette page est réservée aux secrétaires.</p>
                </div>
            </div>
        );
    }

    if (!monCompte) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Aucun compte trouvé</h1>
                    <p className="mt-2 text-gray-600">Votre compte secrétaire n'a pas été trouvé.</p>
                </div>
            </div>
        );
    }

    const soldeActuel = parseFloat(monCompte.soldeActuel.toString());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Mon Compte Secrétaire</h1>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">{monCompte.nom}</h2>
                    <p className="text-sm text-gray-600">Compte secrétaire</p>
                </div>
                
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Solde actuel</p>
                    <p className={`text-4xl font-bold ${soldeActuel > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {formatCurrency(soldeActuel)} Ar
                    </p>
                </div>

                {soldeActuel > 0 && (
                    <button
                        onClick={() => setIsTransfertModalOpen(true)}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        Transférer le reste au compte admin
                    </button>
                )}

                {soldeActuel === 0 && (
                    <div className="rounded-lg bg-zinc-100 p-4 text-center">
                        <p className="text-sm text-gray-600">Aucun solde à transférer</p>
                    </div>
                )}
            </div>

            {/* Modal Transfert */}
            {isTransfertModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold">Transférer le reste</h2>
                        <div className="mb-4 rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-gray-700">
                                <strong>Montant à transférer:</strong> {formatCurrency(soldeActuel)} Ar
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Compte destination
                                </label>
                                <select
                                    value={transfertForm.compteDestinationId}
                                    onChange={(e) =>
                                        setTransfertForm({ ...transfertForm, compteDestinationId: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                >
                                    <option value="">Sélectionner un compte</option>
                                    {comptesDestination.map((compte) => (
                                        <option key={compte.id} value={compte.id}>
                                            {compte.nom} ({formatCurrency(parseFloat(compte.soldeActuel.toString()))} Ar)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description (optionnel)
                                </label>
                                <textarea
                                    value={transfertForm.description}
                                    onChange={(e) =>
                                        setTransfertForm({ ...transfertForm, description: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                    rows={3}
                                    placeholder="Ex: Transfert du reste du mois de janvier"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setIsTransfertModalOpen(false);
                                    setTransfertForm({ compteDestinationId: "", description: "" });
                                }}
                                className="flex-1 rounded-lg bg-zinc-200 px-4 py-2 font-medium transition hover:bg-zinc-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleTransfert}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                            >
                                Transférer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
