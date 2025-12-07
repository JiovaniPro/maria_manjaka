import api from './apiClient';
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
        try {
            // api.get() retourne déjà les données extraites (via apiRequest)
            const data = await api.get<Categorie[]>('/categories', { params });
            // Si les données sont déjà un tableau, les retourner directement
            if (Array.isArray(data)) {
                return data;
            }
            // Si les données ont la structure { success, message, data }
            if (data && typeof data === 'object' && 'data' in data) {
                return (data as any).data || [];
            }
            console.error('Structure de réponse inattendue:', data);
            return [];
        } catch (error: any) {
            console.error('Erreur dans categorieService.getAll:', error);
            // Si c'est une erreur Axios, essayer d'extraire le message
            if (error.response) {
                throw new Error(error.response.data?.message || 'Erreur lors de la récupération des catégories');
            }
            throw error;
        }
    },

    async getById(id: number): Promise<Categorie> {
        const data = await api.get<Categorie>(`/categories/${id}`);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Categorie;
    },

    async create(categorie: CreateCategorieDto): Promise<Categorie> {
        const data = await api.post<Categorie>('/categories', categorie);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Categorie;
    },

    async update(id: number, updates: Partial<CreateCategorieDto>): Promise<Categorie> {
        const data = await api.put<Categorie>(`/categories/${id}`, updates);
        if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data;
        }
        return data as Categorie;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/categories/${id}`);
    },
};
