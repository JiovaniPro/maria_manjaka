import api from './apiClient';
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
        const data = await api.get<Transaction[]>('/transactions', { params: filters });
        if (Array.isArray(data)) {
            return data;
        }
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || [];
        }
        return [];
    },

    async getById(id: number): Promise<Transaction> {
        const data = await api.get<Transaction>(`/transactions/${id}`);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Transaction;
    },

    async getStats(dateDebut?: string, dateFin?: string): Promise<TransactionStats> {
        const data = await api.get<TransactionStats>('/transactions/stats', {
            params: { dateDebut, dateFin },
        });
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as TransactionStats;
    },

    async create(transaction: CreateTransactionDto): Promise<Transaction> {
        const data = await api.post<Transaction>('/transactions', transaction);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Transaction;
    },

    async update(id: number, updates: Partial<CreateTransactionDto>): Promise<Transaction> {
        const data = await api.put<Transaction>(`/transactions/${id}`, updates);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Transaction;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/transactions/${id}`);
    },
};
