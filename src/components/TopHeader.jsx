import React from 'react';
import { Sprout, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TopHeader({ navigate, isLogged }) {
  const location = useLocation();
  
  // Helper function untuk highlight active state
  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(isLogged ? '/dashboard' : '/')}>
          <Sprout className="text-red-700" size={28} />
          <span className="text-2xl font-black text-red-700 tracking-tighter">Strise</span>
        </div>
        
        {!isLogged ? (
          <button onClick={() => navigate('/login')} className="font-bold tracking-tight text-red-700 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all">
            Masuk
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 mr-4">
              {/* Highlight diberikan dengan text-red-700 */}
              <button onClick={() => navigate('/dashboard')} className={`font-medium transition-colors ${isActive('/dashboard') ? 'text-red-700 font-bold' : 'text-slate-600 hover:text-red-700'}`}>Dashboard</button>
              <button onClick={() => navigate('/monitoring')} className={`font-medium transition-colors ${isActive('/monitoring') ? 'text-red-700 font-bold' : 'text-slate-600 hover:text-red-700'}`}>Monitoring</button>
              <button onClick={() => navigate('/history')} className={`font-medium transition-colors ${isActive('/history') ? 'text-red-700 font-bold' : 'text-slate-600 hover:text-red-700'}`}>Riwayat</button>
            </nav>
            {/* Navigasi Notifikasi diarahkan ke /monitoring karena peringatannya ada disana */}
            <button onClick={() => navigate('/monitoring')} className="hidden md:flex w-10 h-10 rounded-full hover:bg-slate-100 items-center justify-center text-slate-600">
              <Bell size={20} />
            </button>
            {/* Navigasi Profil diarahkan ke /profil */}
            <button onClick={() => navigate('/profil')} className="rounded-full overflow-hidden w-10 h-10 border-2 border-red-100">
              <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2bMsgt13WU2117YH2m24Ci8lMKaPRDvVQ8aeWiN-5EIfDNi27z266d5wq5RuCy77Amu87u2rKGBeeyDpLt8ZY_8a3U6mtbBxMJ1BfK2F91J5cN057PRrpmcEEFs2rGPYkErtdRcW3Qrrbs4h8WDHxHzi5lCjDhzOg0ShsiyHxxl1Br_6dBAp6fTZFACUuGQhmyyPLcMwUUI8iwKEeDEM90xFh9LNiV_6NpOQtHi0gQAggSMd9k01fp89pVPaYvKi_xK7qGiTnhVs"/>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}