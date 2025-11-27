// Types TypeScript partagés correspondant aux réponses API backend

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type User = {
    id: number;
    email: string;
    nom: string;
    createdAt: string;
    updatedAt: string;
};

export type Categorie = {
    id: number;
    nom: string;
    codeBudgetaire: string;
    type: 'RECETTE' | 'DEPENSE';
    statut: 'ACTIF' | 'INACTIF';
    createdAt?: string;
    updatedAt?: string;
};

export type Compte = {
    id: number;
    nom: string;
    type: 'CAISSE' | 'BANQUE';
    soldeActuel: number;
    createdAt?: string;
    updatedAt?: string;
};

export type Transaction = {
    id: number;
    categorieId: number;
    compteId: number;
    dateTransaction: string;
    description: string;
    montant: number;
    type: 'RECETTE' | 'DEPENSE';
    createdBy: number;
    createdAt?: string;
    updatedAt?: string;
    // Relations incluses
    categorie?: Categorie;
    compte?: Compte;
    user?: {
        nom: string;
        email: string;
    };
};

export type TransactionBancaire = {
    id: number;
    compteId: number;
    dateOperation: string;
    description: string;
    montant: number;
    type: 'RETRAIT' | 'DEPOT';
    numeroCheque?: string;
    createdAt?: string;
    updatedAt?: string;
    compte?: Compte;
};

export type Parametre = {
    id: number;
    cle: string;
    valeur: string;
    description?: string;
    updatedAt?: string;
};

export type TransactionStats = {
    totalRecettes: number;
    nombreRecettes: number;
    totalDepenses: number;
    nombreDepenses: number;
    soldeNet: number;
};

export type AuditLog = {
    id: number;
    userId: number;
    action: string;
    tableName: string;
    recordId: number;
    oldValue?: any;
    newValue?: any;
    createdAt: string;
    user?: {
        nom: string;
        email: string;
    };
};
