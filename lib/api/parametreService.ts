import apiClient from './apiClient';
import type { ApiResponse, Parametre } from '../types';

type UpsertParametreDto = {
    cle: string;
    valeur: string;
    description?: string;
};

export const parametreService = {
    async getAll(): Promise<Parametre[]> {
        const { data } = await apiClient.get<ApiResponse<Parametre[]>>('/parametres');
        return data.data;
    },

    async getByCle(cle: string): Promise<Parametre> {
        const { data } = await apiClient.get<ApiResponse<Parametre>>(`/parametres/${cle}`);
        return data.data;
    },

    async upsert(parametre: UpsertParametreDto): Promise<Parametre> {
        const { data } = await apiClient.post<ApiResponse<Parametre>>('/parametres', parametre);
        return data.data;
    },

    async update(cle: string, updates: { valeur?: string; description?: string }): Promise<Parametre> {
        const { data } = await apiClient.put<ApiResponse<Parametre>>(`/parametres/${cle}`, updates);
        return data.data;
    },

    async delete(cle: string): Promise<void> {
        await apiClient.delete(`/parametres/${cle}`);
    },
};
