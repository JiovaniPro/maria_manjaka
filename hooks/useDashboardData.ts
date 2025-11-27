// Hook personnalisé pour charger les données du dashboard
'use client';

import { useState, useEffect } from 'react';
import { transactionService } from '@/lib/api/transactionService';
import { compteService } from '@/lib/api/compteService';
import { parametreService } from '@/lib/api/parametreService';
import type { Compte, TransactionStats } from '@/lib/types';
import { formatMontant, formatDate } from '@/lib/helpers';

export type DashboardTransaction = {
    date: string;
    description: string;
    montant: string;
};

export type DashboardAccount = {
    name: string;
    solde: string;
};

export type DashboardData = {
    stats: TransactionStats | null;
    comptes: Compte[];
    recentTransactions: DashboardTransaction[];
    loading: boolean;
    error: string | null;
};

export function useDashboardData() {
    const [data, setData] = useState<DashboardData>({
        stats: null,
        comptes: [],
        recentTransactions: [],
        loading: true,
        error: null,
    });

    const loadDashboardData = async () => {
        try {
            setData(prev => ({ ...prev, loading: true, error: null }));

            // Charger les données en parallèle
            const [stats, comptes, latestTransactions, devise] = await Promise.all([
                transactionService.getStats(),
                compteService.getAll(),
                transactionService.getAll({ limit: 5 }),
                parametreService.getByCle('devise').catch(() => ({ valeur: 'Ar' })),
            ]);

            // Formater les transactions récentes
            const recentTx = latestTransactions.map(tx => ({
                date: formatDate(tx.dateTransaction),
                description: tx.description,
                montant: formatMontant(tx.montant, devise.valeur),
            }));

            setData({
                stats,
                comptes,
                recentTransactions: recentTx,
                loading: false,
                error: null,
            });
        } catch (error: any) {
            console.error('Dashboard data loading error:', error);
            setData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || 'Erreur de chargement des données',
            }));
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    return {
        ...data,
        refresh: loadDashboardData,
    };
}
