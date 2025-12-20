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
      <header className="sticky top-0 z-50 flex flex-col bg-gray-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-8 py-4">
          <img src="/logo.jpg" className="h-12 w-16 rounded" alt="Logo" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex flex-col bg-gray-800/50 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        <Link to="/" className="flex items-center">
          <img src="/logo.jpg" className="h-12 w-16 rounded" alt="Logo" />
        </Link>

        <nav className="hidden gap-6 font-semibold text-white md:flex">
          <Link to="/" className="transition hover:text-blue-400">
            Accueil
          </Link>
          <Link to="/a-propos" className="transition hover:text-blue-400">
            À propos
          </Link>
          <Link to="/formations" className="transition hover:text-blue-400">
            Formations
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <UserAvatar />
          ) : (
            <Button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white hover:bg-blue-900"
            >
              Connexion
            </Button>
          )}
        </div>
      </div>

      {/* Navbar secondaire visible uniquement sur petits écrans */}
      <nav className="flex justify-around border-t border-gray-500 bg-gray-700/80 px-4 py-2 md:hidden">
        <Link to="/" className="transition hover:text-blue-400">
          Accueil
        </Link>
        <Link to="/a-propos" className="transition hover:text-blue-400">
          À propos
        </Link>
        <Link to="/formations" className="transition hover:text-blue-400">
          Formations
        </Link>
      </nav>
    </header>
  );
};

export default Header;
