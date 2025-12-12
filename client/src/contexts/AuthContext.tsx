import { authApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import type { ReactNode } from 'react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

export type User = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  role?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      // On ne bloque pas la déconnexion même si la requête échoue
      // car on veut quand même déconnecter l'utilisateur côté client
      try {
        await Promise.race([
          authApi.logout(),
          // Timeout après 3 secondes pour éviter de bloquer la déconnexion
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 3000)
          )
        ]);
      } catch (error) {
        console.warn('La déconnexion a pris trop de temps ou a échoué, mais l\'utilisateur sera déconnecté', error);
      }
      
      // Nettoyage côté client dans tous les cas
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);

      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
      });
      
      // Redirection vers la page de connexion
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        setUser(null);
        return;
      }

      // Vérifier si le token est valide
      const response = await authApi.refreshToken({ refresh: refreshToken });

      if (response.data) {
        const { access, user: userData } = response.data;
        localStorage.setItem('token', access);
        setUser(userData);
      } else {
        await logout();
      }
    } catch (error) {
      console.error("Erreur de vérification d'authentification:", error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const [, setIsLoggingIn] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    // Validation des entrées
    if (!email || !password) {
      throw new Error('Veuillez remplir tous les champs');
    }

    setIsLoggingIn(true);

    try {
      // Appel à l'API de connexion
      const response = await authApi.login({ email, password });
      const { access, refresh, user: userData } = response.data;

      // Stockage des tokens
      localStorage.setItem('token', access);
      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }

      // Mise à jour de l'état utilisateur
      setUser(userData);

      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${userData.prenom} ${userData.nom}`,
      });

      // Redirection vers la page d'accueil
      window.location.href = '/';
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      // Gestion des erreurs spécifiques
      if (error.response?.status === 401) {
        errorMessage = 'Identifiants incorrects';
      } else if (error.response?.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      } else {
        console.error('Erreur de connexion:', error);
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: errorMessage,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
}
