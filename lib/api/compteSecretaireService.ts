import api from './apiClient';
import type { ApiResponse, Compte } from '../types';

type User = {
    id: number;
    email: string;
    nom: string;
    role: string;
};

type CompteSecretaire = Compte & {
    usersSecretaires?: User[];
};

type CreateCompteSecretaireDto = {
    email: string;
    motDePasse: string;
    nom: string;
    nomCompte: string;
};

type AlimenterCompteDto = {
    montant: number;
    compteSourceId: number;
    description?: string;
};

type TransfererResteDto = {
    compteDestinationId: number;
    description?: string;
};

export const compteSecretaireService = {
    async getAll(): Promise<CompteSecretaire[]> {
        const data = await api.get<CompteSecretaire[]>('/comptes-secretaires');
        // Gérer les deux structures possibles de réponse
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || [];
        }
        return Array.isArray(data) ? data : [];
    },

    async getMonCompte(): Promise<CompteSecretaire> {
        const data = await api.get<CompteSecretaire>('/comptes-secretaires/mon-compte');
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as CompteSecretaire;
    },

    async create(compte: CreateCompteSecretaireDto): Promise<{ compte: CompteSecretaire; user: User }> {
        const data = await api.post<{ compte: CompteSecretaire; user: User }>(
            '/comptes-secretaires',
            compte
        );
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as { compte: CompteSecretaire; user: User };
    },

    async alimenter(id: number, alimentation: AlimenterCompteDto): Promise<void> {
        await api.post(`/comptes-secretaires/${id}/alimenter`, alimentation);
    },

    async transfererReste(id: number, transfert: TransfererResteDto): Promise<{ montantTransfere: number }> {
        const data = await api.post<{ montantTransfere: number }>(
            `/comptes-secretaires/${id}/transferer-reste`,
            transfert
        );
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as { montantTransfere: number };
    },
};
