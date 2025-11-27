'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/api/authService';
import type { User } from '@/lib/types';

type AuthContextType = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, motDePasse: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Charger l'utilisateur au démarrage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (error) {
                // Si erreur de parsing, on nettoie
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, motDePasse: string) => {
        try {
            console.log('📡 Tentative de connexion:', { email, apiUrl: process.env.NEXT_PUBLIC_API_URL });
            const response = await authService.login({ email, motDePasse });
            console.log('✅ Login réussi:', response);

            setToken(response.token);
            setUser(response.user);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        } catch (error: any) {
            console.error('❌ Erreur de login:', error);
            console.error('Response data:', error.response?.data);
            console.error('Response status:', error.response?.status);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            // Même en cas d'erreur sur le backend, on déconnecte localement
        } finally {
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
