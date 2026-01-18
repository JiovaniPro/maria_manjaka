import api from './apiClient';
import type { ApiResponse, Compte, Transaction, TransactionBancaire } from '../types';

type CompteFilters = {
    type?: 'CAISSE' | 'BANQUE' | 'SECRETAIRE';
};

type CreateCompteDto = {
    nom: string;
    type: 'CAISSE' | 'BANQUE' | 'SECRETAIRE';
    soldeActuel?: number;
};

type MouvementsResponse = {
    transactions: Transaction[];
    transactionsBancaires: TransactionBancaire[];
};

export const compteService = {
    async getAll(params?: CompteFilters): Promise<Compte[]> {
        const data = await api.get<Compte[]>('/comptes', { params });
        // Gérer les deux structures possibles de réponse
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || [];
        }
        return Array.isArray(data) ? data : [];
    },

    async getById(id: number): Promise<Compte> {
        const data = await api.get<Compte>(`/comptes/${id}`);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Compte;
    },

    async getSolde(id: number): Promise<Compte> {
        const data = await api.get<Compte>(`/comptes/${id}/solde`);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Compte;
    },

    async getMouvements(id: number, limit = 50): Promise<MouvementsResponse> {
        const data = await api.get<MouvementsResponse>(
            `/comptes/${id}/mouvements`,
            { params: { limit } }
        );
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as MouvementsResponse;
    },

    async create(compte: CreateCompteDto): Promise<Compte> {
        const data = await api.post<Compte>('/comptes', compte);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Compte;
    },

    async update(id: number, updates: Partial<CreateCompteDto>): Promise<Compte> {
        const data = await api.put<Compte>(`/comptes/${id}`, updates);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Compte;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/comptes/${id}`);
    },
};
