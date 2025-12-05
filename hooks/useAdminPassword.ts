import { useState, useEffect } from 'react';
import api from '@/services/api';

export function useAdminPassword() {
  const [adminPassword, setAdminPassword] = useState<string>('1234'); // Valeur par défaut
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminPassword = async () => {
      try {
        const response = await api.get('/parametres/ADMIN_PASSWORD');
        if (response.data?.data?.valeur) {
          setAdminPassword(response.data.data.valeur);
        }
      } catch (error: any) {
        // Si le paramètre n'existe pas encore (404) ou erreur d'auth (401), utiliser la valeur par défaut
        if (error.response?.status === 404 || error.response?.status === 401) {
          console.log('Admin password parameter not found or unauthorized, using default');
        } else {
          console.error('Error fetching admin password:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminPassword();
  }, []);

  return { adminPassword, isLoading };
}

