import apiClient from './apiClient';
import type { ApiResponse, TransactionBancaire } from '../types';

type TransactionBancaireFilters = {
    compteId?: number;
    type?: 'RETRAIT' | 'DEPOT';
    dateDebut?: string;
    dateFin?: string;
};

type CreateTransactionBancaireDto = {
    compteId: number;
    dateOperation: string;
    description: string;
    montant: number;
    type: 'RETRAIT' | 'DEPOT';
    numeroCheque?: string;
};

export const transactionBancaireService = {
    async getAll(filters?: TransactionBancaireFilters): Promise<TransactionBancaire[]> {
        const { data } = await apiClient.get<ApiResponse<TransactionBancaire[]>>(
            '/transactions-bancaires',
            { params: filters }
        );
        return data.data;
    },

    async getById(id: number): Promise<TransactionBancaire> {
        const { data } = await apiClient.get<ApiResponse<TransactionBancaire>>(
            `/transactions-bancaires/${id}`
        );
        return data.data;
    },

    async create(transaction: CreateTransactionBancaireDto): Promise<TransactionBancaire> {
        const { data } = await apiClient.post<ApiResponse<TransactionBancaire>>(
            '/transactions-bancaires',
            transaction
        );
        return data.data;
    },

    async update(
        id: number,
        updates: Partial<CreateTransactionBancaireDto>
    ): Promise<TransactionBancaire> {
        const { data } = await apiClient.put<ApiResponse<TransactionBancaire>>(
            `/transactions-bancaires/${id}`,
            updates
        );
        return data.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/transactions-bancaires/${id}`);
    },
};
