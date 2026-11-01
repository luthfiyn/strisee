import React from 'react';
import { LayoutDashboard, ChartNoAxesCombined, Camera, History, User } from 'lucide-react';

export default function BottomNav({ currentPage, navigate }) {
  const isActive = (page) => currentPage === page;
  
  return (
    <nav className="md:hidden bg-white/90 backdrop-blur-xl text-xs uppercase tracking-widest fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-2 pb-4 pt-2 shadow-[0_-8px_32px_rgba(0,0,0,0.05)] border-t border-slate-100">
      <button onClick={() => navigate('/dashboard')} className={`flex flex-col items-center justify-center p-2 w-16 transition-colors ${isActive('dashboard') ? 'text-red-700 font-bold' : 'text-slate-500'}`}>
        <LayoutDashboard size={24} className="mb-1" />
        <span>Dasbor</span>
      </button>
      <button onClick={() => navigate('/monitoring')} className={`flex flex-col items-center justify-center p-2 w-16 transition-colors ${isActive('monitoring') ? 'text-red-700 font-bold' : 'text-slate-500'}`}>
        <ChartNoAxesCombined size={24} className="mb-1" />
        <span>Monitoring</span>
      </button>
      <button onClick={() => navigate('/diagnostic')} className="flex flex-col items-center justify-center bg-red-700 text-white rounded-full p-4 -mt-6 mb-1 shadow-lg hover:scale-105 active:scale-95 transition-all border-4 border-slate-50">
        <Camera size={28} />
      </button>
      <button onClick={() => navigate('/history')} className={`flex flex-col items-center justify-center p-2 w-16 transition-colors ${isActive('history') ? 'text-red-700 font-bold' : 'text-slate-500'}`}>
        <History size={24} className="mb-1" />
        <span>Riwayat</span>
      </button>
      <button onClick={() => navigate('/profil')} className={`flex flex-col items-center justify-center p-2 w-16 transition-colors ${isActive('profil') ? 'text-red-700 font-bold' : 'text-slate-500'}`}>
        <User size={24} className="mb-1" />
        <span>Profil</span>
      </button>
    </nav>
  );
}