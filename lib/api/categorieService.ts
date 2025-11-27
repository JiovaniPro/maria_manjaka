import apiClient from './apiClient';
import type { ApiResponse, Categorie } from '../types';

type CategorieFilters = {
    type?: 'RECETTE' | 'DEPENSE';
    statut?: 'ACTIF' | 'INACTIF';
};

type CreateCategorieDto = {
    nom: string;
    codeBudgetaire: string;
    type: 'RECETTE' | 'DEPENSE';
    statut?: 'ACTIF' | 'INACTIF';
};

export const categorieService = {
    async getAll(params?: CategorieFilters): Promise<Categorie[]> {
        const { data } = await apiClient.get<ApiResponse<Categorie[]>>('/categories', { params });
        return data.data;
    },

    async getById(id: number): Promise<Categorie> {
        const { data } = await apiClient.get<ApiResponse<Categorie>>(`/categories/${id}`);
        return data.data;
    },

    async create(categorie: CreateCategorieDto): Promise<Categorie> {
        const { data } = await apiClient.post<ApiResponse<Categorie>>('/categories', categorie);
        return data.data;
    },

    async update(id: number, updates: Partial<CreateCategorieDto>): Promise<Categorie> {
        const { data } = await apiClient.put<ApiResponse<Categorie>>(`/categories/${id}`, updates);
        return data.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/categories/${id}`);
    },
};
