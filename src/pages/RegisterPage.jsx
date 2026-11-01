import React, { useState } from 'react';
import { Tractor, ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    setLoading(false);
    if (error) {
      alert("Registrasi Gagal: " + error.message);
    } else {
      alert("Registrasi berhasil! Silakan login.");
      navigate('/login');
    }
  };

  return (
    <div className="flex-grow flex w-full h-screen">
      <div className="hidden lg:flex lg:w-5/12 relative bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBvuojdY57h3mvyDyG7lf_TYQbcT0ieynVnDQl9EMbpu6Kep07_oZIytKzG9NoNOuvQYl9VAKj2J74dWVLyacz6G6VecwX_jM6NnammDEsEwjAye82O3QWSL9w2Foa9-zrTsOANh96fOhvfj_37WFHj9VPm6SJzrnmXW_7or2imQd9TN0b2ag8SGMmWMuCDO_CEjpouhmq366em075oGSKh_Do7hOdWqV8bK-j8LmZE-NyqOHQebgBc3BmMCtLeLhmF9LCWiadxbaQ')"}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-red-900/40 to-transparent mix-blend-multiply"></div>
        <div className="relative z-10 mt-auto mb-16 ml-12 p-8 bg-white/80 backdrop-blur-md rounded-xl max-w-sm shadow-2xl border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Tractor className="text-red-700" size={32} />
            <span className="font-extrabold text-2xl tracking-tighter text-slate-900">Strise</span>
          </div>
          <p className="text-slate-700 text-base leading-relaxed">Elevating horticultural precision through advanced environmental modeling and organic vitality tracking.</p>
        </div>
      </div>
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-slate-50 relative overflow-y-auto">
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center space-x-2 text-slate-500 hover:text-red-700 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm uppercase tracking-widest font-semibold">Kembali</span>
        </button>
        <div className="max-w-md w-full space-y-12 bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl border border-slate-100 mt-16 sm:mt-0">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">Gabung Strise</h1>
            <p className="text-slate-500 text-lg">Mulai perjalanan bertani presisi Anda hari ini.</p>
          </div>
          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.15em] font-bold text-slate-500">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={18} className="text-slate-400" /></div>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" required className="block w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-md text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.15em] font-bold text-slate-500">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={18} className="text-slate-400" /></div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@orchard.co" required className="block w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-md text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.15em] font-bold text-slate-500">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="block w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-md text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all" />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-6 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50">
                {loading ? 'Memproses...' : 'Buat Akun'}
              </button>
            </div>
          </form>
          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">Sudah punya akun? <button onClick={() => navigate('/login')} className="font-bold text-red-700 hover:text-red-800 ml-1">Masuk di sini</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}