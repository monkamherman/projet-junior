import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-gray-950/80 px-8 py-4 backdrop-blur-md">
      {/* <div className="text-2xl font-bold">CENTIC</div> */}
      <img src="/logo.jpg" className="h-12 w-16 rounded" alt="" />
      <nav className="hidden gap-6 md:flex">
        <a href="home" className="transition hover:text-blue-400">
          Home
        </a>
        <a href="#" className="transition hover:text-blue-400">
          About
        </a>
        <a href="#" className="transition hover:text-blue-400">
          Formations
        </a>
        <a href="#" className="transition hover:text-blue-400">
          Apprenants
        </a>
      </nav>
      <div className="flex items-center gap-4">
        <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium transition hover:bg-blue-700">
          connexion
        </button>
      </div>
    </header>
  );
};

export default Header;
