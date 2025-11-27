import apiClient from './apiClient';
import type { ApiResponse, Compte, Transaction, TransactionBancaire } from '../types';

type CompteFilters = {
    type?: 'CAISSE' | 'BANQUE';
};

type CreateCompteDto = {
    nom: string;
    type: 'CAISSE' | 'BANQUE';
    soldeActuel?: number;
};

type MouvementsResponse = {
    transactions: Transaction[];
    transactionsBancaires: TransactionBancaire[];
};

export const compteService = {
    async getAll(params?: CompteFilters): Promise<Compte[]> {
        const { data } = await apiClient.get<ApiResponse<Compte[]>>('/comptes', { params });
        return data.data;
    },

    async getById(id: number): Promise<Compte> {
        const { data } = await apiClient.get<ApiResponse<Compte>>(`/comptes/${id}`);
        return data.data;
    },

    async getSolde(id: number): Promise<Compte> {
        const { data } = await apiClient.get<ApiResponse<Compte>>(`/comptes/${id}/solde`);
        return data.data;
    },

    async getMouvements(id: number, limit = 50): Promise<MouvementsResponse> {
        const { data } = await apiClient.get<ApiResponse<MouvementsResponse>>(
            `/comptes/${id}/mouvements`,
            { params: { limit } }
        );
        return data.data;
    },

    async create(compte: CreateCompteDto): Promise<Compte> {
        const { data } = await apiClient.post<ApiResponse<Compte>>('/comptes', compte);
        return data.data;
    },

    async update(id: number, updates: Partial<CreateCompteDto>): Promise<Compte> {
        const { data } = await apiClient.put<ApiResponse<Compte>>(`/comptes/${id}`, updates);
        return data.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/comptes/${id}`);
    },
};
