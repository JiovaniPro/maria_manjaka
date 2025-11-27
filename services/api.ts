import axios from 'axios';

// Configuration de base de l'instance Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL du backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse (ex: token expiré)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si non autorisé (token invalide ou expiré), rediriger vers la connexion
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Éviter de rediriger si on est déjà sur la page de connexion
        if (!window.location.pathname.includes('/connexion')) {
          window.location.href = '/connexion';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
