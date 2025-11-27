import apiClient from './apiClient';
import type { ApiResponse, Transaction, TransactionStats } from '../types';

type TransactionFilters = {
    categorieId?: number;
    compteId?: number;
    type?: 'RECETTE' | 'DEPENSE';
    dateDebut?: string;
    dateFin?: string;
    limit?: number;
};

type CreateTransactionDto = {
    categorieId: number;
    compteId: number;
    dateTransaction: string;
    description: string;
    montant: number;
    type: 'RECETTE' | 'DEPENSE';
};

export const transactionService = {
    async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
        const { data } = await apiClient.get<ApiResponse<Transaction[]>>('/transactions', {
            params: filters,
        });
        return data.data;
    },

    async getById(id: number): Promise<Transaction> {
        const { data } = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
        return data.data;
    },

    async getStats(dateDebut?: string, dateFin?: string): Promise<TransactionStats> {
        const { data } = await apiClient.get<ApiResponse<TransactionStats>>('/transactions/stats', {
            params: { dateDebut, dateFin },
        });
        return data.data;
    },

    async create(transaction: CreateTransactionDto): Promise<Transaction> {
        const { data } = await apiClient.post<ApiResponse<Transaction>>('/transactions', transaction);
        return data.data;
    },

    async update(id: number, updates: Partial<CreateTransactionDto>): Promise<Transaction> {
        const { data } = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, updates);
        return data.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/transactions/${id}`);
    },
};
