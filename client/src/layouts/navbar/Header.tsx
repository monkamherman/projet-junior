import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
    <div className="text-2xl font-bold">Gratech</div>
    <nav className="hidden md:flex gap-6">
      <a href="#" className="hover:text-blue-400 transition">Home</a>
      <a href="#" className="hover:text-blue-400 transition">About</a>
      <a href="#" className="hover:text-blue-400 transition">Services</a>
      <a href="#" className="hover:text-blue-400 transition">Pages</a>
      <a href="#" className="hover:text-blue-400 transition">Blog</a>
      <a href="#" className="hover:text-blue-400 transition">Contact</a>
    </nav>
    <div className="flex items-center gap-4">
      <button className="bg-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
        Get a Quote
      </button>
      
    </div>
  </header>
  )
}

export default Header
