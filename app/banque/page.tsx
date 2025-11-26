"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useToast } from "@/components/ToastContainer"; // Rétabli: Utilisation de votre ToastContainer
import { LoadingScreen } from "@/components/LoadingScreen"; // Assurez-vous du chemin
import { useLoading } from "@/hooks/useLoading"; // Assurez-vous du chemin

// ====================================================================
// CONFIG & TYPES
// ====================================================================

// Constante pour la pagination
const ITEMS_PER_PAGE = 10; 
type PreferenceItem = { label: string; icon: () => ReactElement };

type BankTransaction = {
  id: string;
  date: string;
  description: string;
  montant: number;
  type: "Retrait" | "Dépôt";
  numeroCheque?: string; // Optionnel, seulement pour retrait
};

type NavItem = { label: string; icon: () => ReactElement; href: string };


// ====================================================================
// API DATA SIMULATION (À REMPLACER PAR VOTRE FETCH/HOOK API)
// ====================================================================

/**
 * ⚠️ IMPORTANT : Remplacez tout le bloc ci-dessous 
 * par votre logique de récupération de données API.
 */

// 1. Clés Secrètes et Balances
const SECRET_PASSWORD = "1234"; // Simulation mot de passe administrateur
const CAISSE_BALANCE = 500000; // Montant simulé en caisse pour le bouton de dépôt (en EUR ou Ariary)

// 2. Données Mockées (Simulées)
let bankData: BankTransaction[] = [
  { id: "1", date: "2024-11-10", description: "Paiement Loyer Décembre", montant: -1200, type: "Retrait", numeroCheque: "CHQ-88541" },
  { id: "2", date: "2024-11-12", description: "Virement Dîmes Semaine 45", montant: 4500, type: "Dépôt" },
  { id: "3", date: "2024-11-15", description: "Achat Matériel Sonorisation", montant: -850, type: "Retrait", numeroCheque: "CHQ-88542" },
  { id: "4", date: "2024-11-20", description: "Donateur Anonyme", montant: 2000, type: "Dépôt" },
  { id: "5", date: "2024-11-25", description: "Facture Electricité (Jirama)", montant: -320, type: "Retrait", numeroCheque: "CHQ-88543" },
  { id: "6", date: "2024-10-01", description: "Retrait Espèces pour Caisse", montant: -500, type: "Retrait", numeroCheque: "CHQ-88544" },
  { id: "7", date: "2024-10-05", description: "Offrandes du Culte du 05/10", montant: 1500, type: "Dépôt" },
  { id: "8", date: "2024-10-18", description: "Paiement Fournitures Bureau", montant: -150, type: "Retrait", numeroCheque: "CHQ-88545" },
  { id: "9", date: "2024-09-02", description: "Transfert Dîmes Début Sept", montant: 3000, type: "Dépôt" },
  { id: "10", date: "2024-09-15", description: "Frais Bancaires Mensuels", montant: -15, type: "Retrait", numeroCheque: "CHQ-88546" },
  { id: "11", date: "2024-09-28", description: "Don exceptionnel", montant: 1000, type: "Dépôt" },
];

// 3. Calcul du solde actuel (à remplacer par la valeur renvoyée par l'API)
const soldeBanqueActuel = bankData.reduce((acc, curr) => acc + curr.montant, 0); 

// ====================================================================
// FIN API DATA SIMULATION
// ====================================================================

const months = [
    { value: "", label: "Tous les mois" },
    { value: "1", label: "Janvier" }, { value: "2", label: "Février" }, { value: "3", label: "Mars" }, 
    { value: "4", label: "Avril" }, { value: "5", label: "Mai" }, { value: "6", label: "Juin" }, 
    { value: "7", label: "Juillet" }, { value: "8", label: "Août" }, { value: "9", label: "Septembre" }, 
    { value: "10", label: "Octobre" }, { value: "11", label: "Novembre" }, { value: "12", label: "Décembre" },
];
const years = ["", "2024", "2023", "2022"];
const preferenceItems: PreferenceItem[] = [
    { label: "Paramètres", icon: SettingsIcon },
    // { label: "Aide", icon: HelpIcon },
  ];

// ====================================================================
// ICON COMPONENTS
// ====================================================================

function DashboardIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" stroke="none"><path d="M4 3h7v9H4zM13 3h7v5h-7zM13 10h7v11h-7zM4 14h7v7H4z" /></svg>; }
function TransactionsIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M3 5h18v2H3zM3 11h18v2H3zM3 17h18v2H3z" /></svg>; }
function AccountsIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M4 4h16v6H4zM4 14h16v6H4z" /></svg>; }
function CategoriesIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" /></svg>; }
function ReportsIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M5 3h4l2 3h8v15H5z" /></svg>; }
function UsersIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9v-1a5 5 0 015-5h4a5 5 0 015 5v1z" /></svg>; } 
function LogoutIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M10 3h10v18H10v-2h8V5h-8zm-1 6l-4 3 4 3v-2h7v-2H9z" /></svg>; }

// Icons Utilitaires
function IconChurch() {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v6m-4-2 4-4 4 4M5 22v-7l7-5 7 5v7z" strokeLinecap="round" />
      </svg>
    );
  }
// function IconChurch() { return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" /></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/40" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>; }
function PlusIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>; }
function EditIcon() {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    );
  }
  function SettingsIcon() {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 15a3 3 0 110-6 3 3 0 010 6zm8.6-3.5l1.4 2.5-2.1 3.6-2.9-.3a7.1 7.1 0 01-1.6 1l-.5 2.8H9.1l-.5-2.8a7.1 7.1 0 01-1.6-1l-2.9.3-2.1-3.6 1.4-2.5a7.6 7.6 0 010-1l-1.4-2.5L4.1 4.4l2.9.3a7.1 7.1 0 011.6-1L9.1 1h5.8l.5 2.8a7.1 7.1 0 011.6 1l2.9-.3 2.1 3.6-1.4 2.5a7.6 7.6 0 010 1z"/>
  </svg>
  );
  }
// function EditIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>; }
function CloseIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>; }
function BankIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21v-7l8-5 8 5v7M6 10l6-4 6 4" /></svg>; }
function ArrowDownRightIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 7l10 10M17 7v10H7" /></svg>; }
function ArrowUpRightIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" /></svg>; }
// FIX: Correction de la syntaxe JSX pour l'icône CheckIcon
function CheckIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>; }
function CalendarIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function RefreshIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9c-1.88 0-3.66.6-5.05 1.7L3 6M21 12h-4M3 12h4M6 18l-3-3h6l3 3m-9 0v-4" /></svg>; }
function ChevronLeftIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ChevronRightIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function EyeIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /></svg>; }
function EyeOffIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.9 9.9 0 0 1 12 4c7 0 11 8 11 8a18.45 18.45 0 0 1-5.06 5.94M4.24 4.24l15.52 15.52M12 12l.01.01" /></svg>; }

const navItems: NavItem[] = [
  { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
  { label: "Transactions", icon: TransactionsIcon, href: "/transaction" },
//   { label: "Comptes", icon: AccountsIcon, href: "/comptes" },
  { label: "Catégories", icon: CategoriesIcon, href: "/categorie" },
//   { label: "Rapports", icon: ReportsIcon, href: "/rapports" },
  { label: "Transaction Bancaire", icon: UsersIcon, href: "/banque" },
];

// ====================================================================
// SECURE SOLDE CARD COMPONENT
// ====================================================================

function SecureSoldeCard({ soldeActuel, showToast }: { soldeActuel: number, showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void }) {
    const [showSolde, setShowSolde] = useState(false);
    const [soldeAuthModalOpen, setSoldeAuthModalOpen] = useState(false);
    const [soldeAuthPassword, setSoldeAuthPassword] = useState("");
    const timeoutRef = useRef<NodeJS.Timeout>();

    const clearSoldeTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);

    // Gère le timeout de 30 secondes
    useEffect(() => {
        if (showSolde) {
            clearSoldeTimeout(); // Clear any existing timeout
            timeoutRef.current = setTimeout(() => {
                setShowSolde(false);
                showToast("Solde masqué par mesure de sécurité.", "warning");
            }, 30000); // 30 secondes

            return () => clearSoldeTimeout();
        }
    }, [showSolde, showToast, clearSoldeTimeout]);

    const handleToggleVisibility = () => {
        if (showSolde) {
            // L'utilisateur masque manuellement
            setShowSolde(false);
            clearSoldeTimeout(); // Effacer immédiatement le timer
        } else {
            // L'utilisateur tente de déverrouiller
            setSoldeAuthModalOpen(true);
        }
    };

    const handleSoldeAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (soldeAuthPassword === SECRET_PASSWORD) {
            setShowSolde(true);
            setSoldeAuthModalOpen(false);
            setSoldeAuthPassword("");
            showToast("Solde affiché.", "success");
        } else {
            showToast("Code de sécurité incorrect.", "error");
            setSoldeAuthPassword("");
        }
    };

    return (
        <>
            {/* Carte Solde Rapide */}
            <div className="flex items-center gap-4 rounded-3xl border border-black/5 bg-white px-6 py-4 shadow-sm">
                <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                    <BankIcon />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-black/40">Solde Banque</p>
                    <p className={`text-xl font-bold transition-all duration-300 ${showSolde ? 'text-black' : 'text-zinc-400'}`}>
                        {showSolde ? `${soldeActuel.toLocaleString('fr-FR')} €` : '****'}
                    </p>
                </div>
                <button 
                    onClick={handleToggleVisibility}
                    className="rounded-full p-2 text-black/40 transition hover:bg-zinc-100 hover:text-blue-500"
                    title={showSolde ? "Masquer le solde" : "Afficher le solde"}
                >
                    {showSolde ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>

            {/* Modal d'Autorisation du Solde */}
            {soldeAuthModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
                        <h2 className="mb-6 text-xl font-bold text-blue-600">Accès Solde Sécurisé</h2>
                        <p className="mb-4 text-sm text-black/60">Entrez le code pour afficher le solde.</p>
                        <form onSubmit={handleSoldeAuth} className="space-y-4">
                            <input
                                type="password"
                                value={soldeAuthPassword}
                                onChange={(e) => setSoldeAuthPassword(e.target.value)}
                                className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-center text-lg tracking-widest focus:border-blue-500"
                                placeholder="••••"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setSoldeAuthModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-black/60 hover:bg-zinc-50">Annuler</button>
                                <button type="submit" className="rounded-xl bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600">Afficher</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// ====================================================================
// TOTAL FILTER CARD COMPONENT
// ====================================================================

function TotalFilterCard({ total, activeTab }: { total: number, activeTab: "retrait" | "depot" }) {
    const isRetrait = activeTab === "retrait";
    const displayTotal = Math.abs(total);

    const cardClass = isRetrait
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

    const title = isRetrait ? "Total Retraits Filtrés" : "Total Dépôts Filtrés";

    return (
        <div className={`flex flex-col rounded-3xl border-2 p-5 shadow-sm min-w-[200px] ${cardClass}`}>
            <p className="text-xs uppercase tracking-wider opacity-80">{title}</p>
            <p className="text-2xl font-bold mt-1">
                {displayTotal.toLocaleString('fr-FR')} €
            </p>
        </div>
    );
}

// ====================================================================
// MODAL FORM (pour l'ajout/modification)
// ====================================================================

interface ModalFormProps {
    title: string;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    formData: Partial<BankTransaction>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<BankTransaction>>>;
    isRetrait: boolean;
    isModification: boolean;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void; // Ajout du toast
}

const ModalForm: React.FC<ModalFormProps> = ({ title, onSubmit, onClose, formData, setFormData, isRetrait, isModification, showToast }) => {
    
    const shouldShowCheque = isModification ? formData.type === "Retrait" : isRetrait;
    const isNewDeposit = !isModification && !isRetrait; // C'est un nouveau dépôt
      
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // NOUVEAU: Handler pour pré-remplir avec le solde de caisse (UI/UX Amélioré)
    const handleSetCaisseBalance = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setFormData((prev) => ({ ...prev, montant: CAISSE_BALANCE }));
        showToast(`Montant Caisse (${CAISSE_BALANCE.toLocaleString('fr-FR')} €) pré-rempli.`, "info");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-black/40 transition hover:bg-black/5 hover:text-black"><CloseIcon /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Date</label>
                            <input type="date" name="date" required value={formData.date || new Date().toISOString().substring(0, 10)} onChange={handleInputChange} className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm" />
                        </div>
                        
                        {/* Champ Montant avec Bouton Caisse (UI/UX amélioré) */}
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Montant (€)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    name="montant" 
                                    required min="0.01" 
                                    step="0.01" 
                                    value={formData.montant || ""} 
                                    onChange={handleInputChange} 
                                    // Ajuster le padding-right (pr) pour faire de la place au bouton
                                    className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm pr-[150px] focus:border-blue-500" 
                                />
                                {/* Bouton Caisse visible seulement pour l'ajout d'un Dépôt */}
                                {isNewDeposit && (
                                    <button
                                        type="button"
                                        onClick={handleSetCaisseBalance}
                                        disabled={Number(formData.montant) === CAISSE_BALANCE}
                                        // Style du bouton amélioré : couleur Ambre, position absolue
                                        className="absolute right-1 top-1 bottom-1 flex items-center rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-600 hover:shadow-lg disabled:bg-zinc-300 disabled:shadow-none disabled:cursor-not-allowed"
                                        title={`Remplir avec le Solde de Caisse: ${CAISSE_BALANCE.toLocaleString('fr-FR')} €`}
                                    >
                                        CAISSE
                                        <span className="ml-1 text-[10px] opacity-80">({CAISSE_BALANCE.toLocaleString('fr-FR')})</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-sm font-semibold">Description</label>
                        <input type="text" name="description" required value={formData.description || ""} onChange={handleInputChange} className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm" placeholder="Ex: Paiement facture..." />
                    </div>
                    
                    {/* Champ Spécifique Retrait */}
                    {shouldShowCheque && (
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-red-600">
                                N° Chèque <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="numeroCheque"
                                required 
                                value={formData.numeroCheque || ""} 
                                onChange={handleInputChange} 
                                className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-sm placeholder:text-red-300 focus:border-red-500 focus:ring-red-500" 
                                placeholder="Ex: CHQ-000123" 
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-50 mr-3">Annuler</button>
                        <button type="submit" className="rounded-2xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600">
                            {isModification ? "Enregistrer les modifications" : `Ajouter le ${shouldShowCheque ? "Retrait" : "Dépôt"}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
  };


// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function BanquePage() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast(); // UTILISATION DU HOOK useToast

  const isLoading = useLoading(1000);

  // States
  const [activeTab, setActiveTab] = useState<"retrait" | "depot">("retrait");
  // ⚠️ NOTE API: dataVersion peut servir à re-déclencher un fetch de l'API si les opérations (Ajout/Modif) étaient gérées par l'API
  const [dataVersion, setDataVersion] = useState(0); // Trigger refresh
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  
  // Security & Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BankTransaction | null>(null);

  // Form State
  const initialFormData: Partial<BankTransaction> = {
    date: new Date().toISOString().substring(0, 10),
    description: "",
    montant: 0,
    numeroCheque: "",
    type: "Retrait" // Temporaire, sera mis à jour
  };
  const [formData, setFormData] = useState<Partial<BankTransaction>>(initialFormData);

  // --- Handlers ---

  const handleLogout = () => {
    showToast("Déconnexion réussie", "success");
    router.push("/connexion");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterMonth("");
    setFilterYear("");
    setCurrentPage(1);
  };
  
  const handleOpenAddModal = () => {
    const type = activeTab === "retrait" ? "Retrait" : "Dépôt";
    setFormData({
        date: new Date().toISOString().substring(0, 10),
        description: "",
        montant: 0,
        numeroCheque: "",
        type: type
    });
    setIsAddModalOpen(true);
  };

  // --- Logic for Modification ---
  const startModify = (item: BankTransaction) => {
    setSelectedItem(item);
    setAuthPassword("");
    setIsAuthModalOpen(true);
  };

  const verifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword === SECRET_PASSWORD) {
      setIsAuthModalOpen(false);
      setFormData({ 
        ...selectedItem, 
        montant: Math.abs(selectedItem?.montant || 0),
        type: selectedItem?.type 
      } as Partial<BankTransaction>); 
      setIsModifyModalOpen(true);
      showToast("Accès autorisé", "success");
    } else {
      showToast("Code incorrect", "error");
    }
  };

  const handleSaveModification = (e: React.FormEvent) => {
    e.preventDefault();

    const isRetrait = formData.type === "Retrait";
    if (isRetrait && !formData.numeroCheque) {
        showToast("Le N° Chèque est obligatoire pour un Retrait.", "warning");
        return;
    }

    // ⚠️ LOGIQUE API : Remplacez par votre appel PUT/PATCH à l'API
    const index = bankData.findIndex(d => d.id === formData.id);
    if(index !== -1 && formData.id) {
        bankData[index] = { 
            ...bankData[index], 
            ...formData as BankTransaction,
            montant: isRetrait ? -(Number(formData.montant) || 0) : (Number(formData.montant) || 0), // Assurer le signe
            type: formData.type || bankData[index].type 
        };
        showToast("Modification enregistrée", "success");
        setIsModifyModalOpen(false);
        setDataVersion(v => v + 1); // Déclencheur de rafraîchissement
        setCurrentPage(1);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
      e.preventDefault();
      const type = formData.type || activeTab === "retrait" ? "Retrait" : "Dépôt";
      const montant = Number(formData.montant);

      if (type === "Retrait" && !formData.numeroCheque) {
        showToast("Le N° Chèque est obligatoire pour un Retrait.", "warning");
        return;
      }
      if (montant <= 0) {
        showToast("Le montant doit être supérieur à zéro.", "warning");
        return;
      }

      // ⚠️ LOGIQUE API : Remplacez par votre appel POST à l'API
      const newTransaction: BankTransaction = {
          id: Date.now().toString(),
          date: formData.date || new Date().toISOString().substring(0, 10),
          description: formData.description || "Nouvelle transaction",
          montant: type === "Retrait" ? -montant : montant, // Stocker le montant avec le signe
          type: type,
          numeroCheque: type === "Retrait" ? formData.numeroCheque : undefined
      };
      bankData.unshift(newTransaction); // Ajout local simulé
      showToast(`${type} ajouté avec succès.`, "success");
      setIsAddModalOpen(false);
      setDataVersion(v => v + 1); // Déclencheur de rafraîchissement
      setCurrentPage(1);
  };

  // Filter Data based on Tab, Filters, and Search
  const filteredData = useMemo(() => {
    const v = dataVersion; // Dependency
    let data = bankData.filter(d => 
        activeTab === "retrait" ? d.type === "Retrait" : d.type === "Dépôt"
    );
    
    // 1. Filter by Date
    data = data.filter(t => {
        const transactionDate = new Date(t.date);
        const monthNumber = (transactionDate.getMonth() + 1).toString();
        const matchMonth = filterMonth === "" || monthNumber === filterMonth;
        const matchYear = filterYear === "" || transactionDate.getFullYear().toString() === filterYear;
        return matchMonth && matchYear;
    });

    // 2. Filter by Search Term
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(t => 
            t.description.toLowerCase().includes(term) || 
            (t.numeroCheque && t.numeroCheque.toLowerCase().includes(term))
        );
    }

    // Triez par date par défaut (la plus récente d'abord)
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return data;
  }, [activeTab, dataVersion, searchTerm, filterMonth, filterYear]);

  // Calcul du total des éléments filtrés 
  const totalFilteredAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + Math.abs(item.montant), 0);
  }, [filteredData]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-black">
      {/* SIDEBAR */}
      <aside className="sticky top-0 flex h-screen w-72 flex-col justify-between bg-black px-6 py-8 text-white">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <IconChurch />
            <div className="text-sm font-semibold uppercase tracking-[0.3em]">MARIA MANJAKA</div>
          </div>
          <nav className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Menu</p>
            <ul className="space-y-2">
              {navItems.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  <Link href={href} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${pathname === href ? "bg-white text-black" : "text-white/70 hover:bg-white/10"}`}>
                    <Icon /><span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="space-y-4 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Préférences
          </p>
          <ul className="space-y-2">
            {preferenceItems.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/10">
                  <Icon />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white hover:text-black"
          >
            <LogoutIcon />
            <span>Déconnexion</span>
          </button>
        </div>
        {/* <div className="space-y-4 border-t border-white/10 pt-6">
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white hover:text-black">
                <LogoutIcon /><span>Déconnexion</span>
            </button>
        </div> */}
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen flex-1 overflow-y-auto px-10 py-10">
        
        {/* Header Section */}
        <header className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Transaction Bancaire</h1>
                <p className="mt-2 text-sm text-black/60">Gérez les chèques émis et les dépôts bancaires.</p>
            </div>
            {/* Carte Solde Sécurisé (en haut à droite) */}
            <SecureSoldeCard soldeActuel={soldeBanqueActuel} showToast={showToast} />
        </header>

        {/* Filtres, Recherche ET Total Filtré */}
        <div className="mb-6 flex gap-4">
            {/* Filtres et Recherche */}
            <div className="flex flex-1 flex-col rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
                <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Search Input */}
                    <div className="flex flex-1 items-center gap-3 rounded-full border border-black/10 bg-zinc-50 px-4 py-2.5">
                        <SearchIcon />
                        <input
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/40"
                            placeholder="Rechercher par description ou n° chèque..."
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
                        <CalendarIcon />
                        <select
                            value={filterMonth}
                            onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
                            className="bg-transparent text-sm outline-none"
                        >
                            {months.map((month) => (<option key={month.value} value={month.value}>{month.label}</option>))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
                        <CalendarIcon />
                        <select
                            value={filterYear}
                            onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                            className="bg-transparent text-sm outline-none"
                        >
                            <option value="">Toutes les années</option>
                            {years.slice(1).map((year) => (<option key={year} value={year}>{year}</option>))}
                        </select>
                    </div>
                    
                    {/* Reset Filter Button */}
                    <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-black/70 transition hover:bg-zinc-100"
                    >
                        <RefreshIcon />
                        <span>Réinitialiser</span>
                    </button>
                </div>
            </div>

            {/* Carte Total Sommes Filtrées */}
            <TotalFilterCard total={totalFilteredAmount} activeTab={activeTab} />
        </div>

        {/* Action Bar & Tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            
            {/* Tab Switcher */}
            <div className="flex rounded-full border border-black/10 bg-white p-1 shadow-sm">
                <button 
                    onClick={() => { setActiveTab("retrait"); setCurrentPage(1); }}
                    className={`flex items-center gap-2 rounded-full px-6 py-2.5 cursor-pointer text-sm font-semibold transition ${activeTab === "retrait" ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "text-black/60 hover:bg-zinc-50"}`}
                >
                    <ArrowDownRightIcon />
                    Retraits (Chèques)
                </button>
                <button 
                    onClick={() => { setActiveTab("depot"); setCurrentPage(1); }}
                    className={`flex cursor-pointer items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition ${activeTab === "depot" ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" : "text-black/60 hover:bg-zinc-50"}`}
                >
                    <ArrowUpRightIcon />
                    Dépôts
                </button>
            </div>

            {/* Add Button */}
            <button 
                onClick={handleOpenAddModal}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition shadow-lg hover:translate-y-[-1px] ${activeTab === "retrait" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
                <PlusIcon />
                <span>Nouveau {activeTab === "retrait" ? "Retrait" : "Dépôt"}</span>
            </button>
        </div>

        {/* Tableau Specifique */}
        <div className="rounded-3xl border border-black/5 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
            <div className="border-b border-black/5 p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    {activeTab === "retrait" ? (
                        <span className="text-red-600 flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Liste des Chèques émis</span>
                    ) : (
                        <span className="text-emerald-600 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Historique des Dépôts</span>
                    )}
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-black/5 bg-zinc-50">
                        <tr>
                            {activeTab === "retrait" && (
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">N° Chèque</th>
                            )}
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">Montant</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">Date</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.1em] text-black/60">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr><td colSpan={activeTab === "retrait" ? 5 : 4} className="py-8 text-center text-black/40 italic">Aucune transaction bancaire trouvée.</td></tr>
                        ) : (
                            paginatedData.map((item) => (
                                <tr key={item.id} className="border-b border-black/5 transition hover:bg-zinc-50/50">
                                    
                                    {activeTab === "retrait" && (
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 font-mono text-xs font-bold text-red-700">
                                                <CheckIcon />
                                                {item.numeroCheque}
                                            </span>
                                        </td>
                                    )}

                                    <td className="px-6 py-4 text-sm font-medium text-black/80">{item.description}</td>
                                    
                                    {/* Cellule Montant colorée */}
                                    <td className={`px-6 py-4 text-sm font-bold ${item.montant < 0 ? "text-red-600" : "text-emerald-600"}`}>
                                        {item.montant > 0 ? "+" : ""}{Math.abs(item.montant).toLocaleString('fr-FR')} €
                                    </td>
                                    
                                    <td className="px-6 py-4 text-sm text-black/60">
                                        {new Date(item.date).toLocaleDateString('fr-FR')}
                                    </td>
                                    
                                    {/* Action Button */}
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => startModify(item)}
                                            className="rounded-full p-2 text-black/40 transition hover:bg-black/5 hover:text-blue-500"
                                            title="Modifier avec code"
                                        >
                                            <EditIcon />
                                        </button>
                                    </td>
                                
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-black/60">
                Affichage de {Math.min(filteredData.length, startIndex + 1)} à {Math.min(filteredData.length, startIndex + ITEMS_PER_PAGE)} sur {filteredData.length} transactions.
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-black/10 p-2.5 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeftIcon />
              </button>
              <span className="min-w-[80px] text-center text-sm font-medium text-black/70">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-xl border border-black/10 p-2.5 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL AUTHORISATION (CODE) */}
      {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
              <h2 className="mb-6 text-xl font-bold text-blue-600">Zone Sécurisée</h2>
              <p className="mb-4 text-sm text-black/60">Veuillez entrer le code administrateur (Simulé: **{SECRET_PASSWORD}**) pour modifier cette transaction bancaire.</p>
              <form onSubmit={verifyPassword} className="space-y-4">
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-center text-lg tracking-widest focus:border-blue-500"
                    placeholder="••••"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAuthModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-black/60 hover:bg-zinc-50">Annuler</button>
                    <button type="submit" className="rounded-xl bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600">Valider</button>
                  </div>
              </form>
            </div>
          </div>
      )}

      {/* MODAL ADD */}
      {isAddModalOpen && (
          <ModalForm 
            title={activeTab === "retrait" ? "Nouveau Chèque / Retrait" : "Nouveau Dépôt"} 
            onSubmit={handleAddItem} 
            onClose={() => setIsAddModalOpen(false)} 
            formData={formData}
            setFormData={setFormData}
            isRetrait={activeTab === "retrait"}
            isModification={false}
            showToast={showToast} // Passage du hook
          />
      )}

      {/* MODAL MODIFY */}
      {isModifyModalOpen && (
          <ModalForm 
            title={`Modifier ${formData.type || selectedItem?.type}`} 
            onSubmit={handleSaveModification} 
            onClose={() => setIsModifyModalOpen(false)} 
            formData={formData}
            setFormData={setFormData}
            isRetrait={formData.type === "Retrait"}
            isModification={true}
            showToast={showToast} // Passage du hook
          />
      )}
      
      {/* Suppression du rendu de Toast personnalisé: il est maintenant géré par ToastContainer.tsx */}

    </div>
  );
}
