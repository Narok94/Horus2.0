import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { Dumbbell, History, User, LogOut, Library } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-line bg-bg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6" />
            <h1 className="text-2xl font-serif italic tracking-tighter">GymLog</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/library" className={({ isActive }) => `font-mono text-xs uppercase tracking-widest hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 border-b border-line' : 'opacity-50'}`}>
              Biblioteca
            </NavLink>
            <NavLink to="/log" className={({ isActive }) => `font-mono text-xs uppercase tracking-widest hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 border-b border-line' : 'opacity-50'}`}>
              Treinar
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `font-mono text-xs uppercase tracking-widest hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 border-b border-line' : 'opacity-50'}`}>
              Histórico
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `font-mono text-xs uppercase tracking-widest hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 border-b border-line' : 'opacity-50'}`}>
              Perfil
            </NavLink>
          </nav>

          <button onClick={handleLogout} className="opacity-50 hover:opacity-100 transition-opacity">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg border-t border-line px-4 h-16 flex items-center justify-around z-50">
        <NavLink to="/library" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
          <Library className="w-5 h-5" />
          <span className="text-[10px] uppercase font-mono tracking-tighter">Library</span>
        </NavLink>
        <NavLink to="/log" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] uppercase font-mono tracking-tighter">Train</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
          <History className="w-5 h-5" />
          <span className="text-[10px] uppercase font-mono tracking-tighter">History</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px] uppercase font-mono tracking-tighter">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};
