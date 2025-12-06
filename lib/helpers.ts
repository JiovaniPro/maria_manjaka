// Helpers pour mapper les données entre le backend et le frontend

import type { Transaction as BackendTransaction, Categorie, Compte } from './types';

// Mapper le type backend vers le format frontend
export function mapTransactionType(backendType: 'RECETTE' | 'DEPENSE'): 'Revenu' | 'Dépense' {
    return backendType === 'RECETTE' ? 'Revenu' : 'Dépense';
}

// Mapper le type frontend vers le format backend
export function mapToBackendType(frontendType: 'Revenu' | 'Dépense'): 'RECETTE' | 'DEPENSE' {
    return frontendType === 'Revenu' ? 'RECETTE' : 'DEPENSE';
}

// Formatter le montant pour affichage
export function formatMontant(montant: number, devise = 'Ar'): string {
    const formatted = new Intl.NumberFormat('fr-FR').format(Math.abs(montant));
    return montant >= 0 ? `+${formatted} ${devise}` : `-${formatted} ${devise}`;
}

// Mapper une transaction backend vers le format frontend
export function mapBackendTransaction(tx: BackendTransaction) {
    return {
        id: tx.id.toString(),
        date: tx.dateTransaction,
        description: tx.description,
        montant: tx.montant,
        montantAffiche: formatMontant(tx.montant),
        type: mapTransactionType(tx.type),
        categorie: tx.categorie?.nom || '',
        compte: tx.compte?.nom || '',
        categorieId: tx.categorieId,
        compteId: tx.compteId,
    };
}

// Mapper une catégorie backend vers le format frontend
export function mapBackendCategorie(cat: Categorie) {
    return {
        id: cat.id.toString(),
        nom: cat.nom,
        codeBudgetaire: cat.codeBudgetaire,
        type: mapTransactionType(cat.type),
        statut: cat.statut.toLowerCase() as 'actif' | 'inactif',
    };
}

// Mapper un compte backend
export function mapBackendCompte(compte: Compte) {
    return {
        id: compte.id.toString(),
        nom: compte.nom,
        type: compte.type,
        soldeActuel: compte.soldeActuel,
    };
}

// Format pour les dates
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
    });
}

// Format complet de la date
export function formatFullDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

// Formater un nombre avec des espaces tous les 3 chiffres (ex: 100000 -> "100 000")
export function formatNumberWithSpaces(value: string | number): string {
    // Enlever tous les espaces et caractères non numériques sauf le point pour les décimales
    const numericValue = String(value).replace(/[^\d.]/g, '');
    
    // Séparer la partie entière et décimale
    const parts = numericValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Formater la partie entière avec des espaces tous les 3 chiffres
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    // Reconstruire avec la partie décimale si elle existe
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

// Enlever les espaces d'un nombre formaté (ex: "100 000" -> "100000")
export function removeNumberSpaces(value: string): string {
    return value.replace(/\s/g, '');
}