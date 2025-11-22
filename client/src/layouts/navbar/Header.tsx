import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 flex items-center justify-between bg-gray-950/80 px-8 py-4 backdrop-blur-md">
        <img src="/logo.jpg" className="h-12 w-16 rounded" alt="Logo" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700"></div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-gray-600/50 px-8 py-4 backdrop-blur-md">
      <Link to="/" className="flex items-center">
        <img src="/logo.jpg" className="h-12 w-16 rounded" alt="Logo" />
      </Link>

      <nav className="hidden gap-6 md:flex">
        <Link to="/" className="transition hover:text-blue-400">
          Accueil
        </Link>
        <Link to="/a-propos" className="transition hover:text-blue-400">
          À propos
        </Link>
        <Link to="/formations" className="transition hover:text-blue-400">
          Formations
        </Link>
        <Link to="/apprenants" className="transition hover:text-blue-400">
          Apprenants
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <UserAvatar />
        ) : (
          <Button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Connexion
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
