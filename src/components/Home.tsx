import React from 'react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { Dumbbell, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-bg text-ink">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 border border-line rounded-full">
              <Dumbbell className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-6xl font-serif italic tracking-tighter">GymLog</h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
            Precision Training & Data Tracking
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleLogin}
            className="w-full group flex items-center justify-between p-6 border border-line hover:bg-ink hover:text-bg transition-all duration-300"
          >
            <span className="font-mono text-sm uppercase tracking-widest">Entrar com Google</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-line/30 text-left space-y-2">
              <span className="font-serif italic text-xs opacity-50">01</span>
              <p className="font-mono text-[10px] uppercase tracking-wider leading-relaxed">
                Acompanhe cada série, repetição e carga com precisão técnica.
              </p>
            </div>
            <div className="p-4 border border-line/30 text-left space-y-2">
              <span className="font-serif italic text-xs opacity-50">02</span>
              <p className="font-mono text-[10px] uppercase tracking-wider leading-relaxed">
                Visualize seu progresso através de dados históricos detalhados.
              </p>
            </div>
          </div>
        </div>

        <footer className="pt-12 border-t border-line/10">
          <p className="font-mono text-[9px] uppercase tracking-widest opacity-30">
            © 2026 GymLog Technical Systems
          </p>
        </footer>
      </div>
    </div>
  );
};
