import api from './apiClient';
import type { ApiResponse } from '../types';

export type SousCategorie = {
    id: number;
    nom: string;
    categorieId: number;
    statut: 'ACTIF' | 'INACTIF';
    createdAt?: string;
    updatedAt?: string;
    categorie?: {
        id: number;
        nom: string;
        type: 'RECETTE' | 'DEPENSE';
    };
    _count?: {
        transactions: number;
    };
};

type SousCategorieFilters = {
    categorieId?: number;
    statut?: 'ACTIF' | 'INACTIF';
};

type CreateSousCategorieDto = {
    nom: string;
    categorieId: number;
    statut?: 'ACTIF' | 'INACTIF';
};

export const sousCategorieService = {
    async getAll(params?: SousCategorieFilters): Promise<SousCategorie[]> {
        const data = await api.get<SousCategorie[]>('/sous-categories', { params });
        if (Array.isArray(data)) {
            return data;
        }
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || [];
        }
        return [];
    },

    async getById(id: number): Promise<SousCategorie> {
        const data = await api.get<SousCategorie>(`/sous-categories/${id}`);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as SousCategorie;
    },

    async create(sousCategorie: CreateSousCategorieDto): Promise<SousCategorie> {
        const data = await api.post<SousCategorie>('/sous-categories', sousCategorie);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as SousCategorie;
    },

    async update(id: number, updates: Partial<CreateSousCategorieDto>): Promise<SousCategorie> {
        const data = await api.put<SousCategorie>(`/sous-categories/${id}`, updates);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as SousCategorie;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/sous-categories/${id}`);
    },
};

