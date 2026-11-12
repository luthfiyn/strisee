import React from 'react';
import { Icon, Bell, LayoutDashboard, ChartNoAxesCombined, History, Scan, User } from 'lucide-react';
import { strawberry } from '@lucide/lab';
import { useLocation } from 'react-router-dom';

export default function TopHeader({ navigate, isLogged }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuD2bMsgt13WU2117YH2m24Ci8lMKaPRDvVQ8aeWiN-5EIfDNi27z266d5wq5RuCy77Amu87u2rKGBeeyDpLt8ZY_8a3U6mtbBxMJ1BfK2F91J5cN057PRrpmcEEFs2rGPYkErtdRcW3Qrrbs4h8WDHxHzi5lCjDhzOg0ShsiyHxxl1Br_6dBAp6fTZFACUuGQhmyyPLcMwUUI8iwKEeDEM90xFh9LNiV_6NpOQtHi0gQAggSMd9k01fp89pVPaYvKi_xK7qGiTnhVs";

  if (!isLogged) {
    return (
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Icon iconNode={strawberry} className="text-red-700" size={28} />
            <span className="text-2xl font-black text-red-700 tracking-tighter">Strise</span>
          </div>
          <button onClick={() => navigate('/login')} className="font-bold tracking-tight text-red-700 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all">
            Masuk
          </button>
        </div>
      </header>
    );
  }

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          body {
            padding-left: 16rem !important;
          }
        }
      `}</style>

      <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Icon iconNode={strawberry} className="text-red-700" size={28} />
            <span className="text-2xl font-black text-red-700 tracking-tighter">Strise</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/notifications')} 
              className="flex w-10 h-10 rounded-full hover:bg-slate-100 items-center justify-center text-slate-600 relative shrink-0"
            >
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-600 border-2 border-white"></span>
            </button>
            
            <button onClick={() => navigate('/profil')} className="rounded-full overflow-hidden w-10 h-10 border-2 border-red-100 ml-1 shrink-0">
              <img alt="User" className="w-full h-full object-cover" src={avatarUrl} />
            </button>
          </div>
        </div>
      </header>

      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 z-50 bg-white border-r border-slate-100 shadow-sm flex-col justify-between p-6">
        <div className="flex flex-col gap-8">
          
          <div className="flex items-center gap-2.5 px-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Icon iconNode={strawberry} className="text-red-700" size={30} />
            <span className="text-2xl font-black text-red-700 tracking-tighter">Strise</span>
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => navigate('/dashboard')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all ${
                isActive('/dashboard') 
                  ? 'bg-red-50 text-red-700 font-bold shadow-sm' 
                  : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-red-700'
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => navigate('/monitoring')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all ${
                isActive('/monitoring') 
                  ? 'bg-red-50 text-red-700 font-bold shadow-sm' 
                  : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-red-700'
              }`}
            >
              <ChartNoAxesCombined size={20} />
              <span>Monitoring</span>
            </button>

            <button 
              onClick={() => navigate('/diagnostic')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all ${
                isActive('/diagnostic') 
                  ? 'bg-red-50 text-red-700 font-bold shadow-sm' 
                  : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-red-700'
              }`}
            >
              <Scan size={20} />
              <span>Pindai Tanaman</span>
            </button>

            <button 
              onClick={() => navigate('/history')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all ${
                isActive('/history') 
                  ? 'bg-red-50 text-red-700 font-bold shadow-sm' 
                  : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-red-700'
              }`}
            >
              <History size={20} />
              <span>Riwayat</span>
            </button>

            <button 
              onClick={() => navigate('/notifications')} 
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm transition-all ${
                isActive('/notifications') 
                  ? 'bg-red-50 text-red-700 font-bold shadow-sm' 
                  : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-red-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell size={20} />
                <span>Notifikasi</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button 
            onClick={() => navigate('/profil')} 
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
              isActive('/profil') ? 'bg-red-50 text-red-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-semibold'
            }`}
          >
            <div className="rounded-full overflow-hidden w-10 h-10 border-2 border-red-100 shrink-0">
              <img alt="User" className="w-full h-full object-cover" src={avatarUrl} />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-sm font-bold text-slate-900 truncate">Profil Akun</span>
              <span className="text-[11px] text-slate-400 font-medium">Kelola Akun</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}