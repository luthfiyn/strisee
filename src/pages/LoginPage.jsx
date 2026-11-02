import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) alert("Login Gagal: " + error.message);
    else navigate('/dashboard');
  };

  return (
    <main className="flex-grow flex items-center justify-center p-6 h-screen relative bg-slate-50">
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center space-x-2 text-slate-500 hover:text-red-700 transition-colors group z-10">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm uppercase tracking-widest font-semibold">Kembali</span>
      </button>

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang Kembali</h1>
          <p className="text-slate-500 text-sm">Akses dashboard perkebunan presisi Anda.</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={18} className="text-slate-400" /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-900">Kata Sandi</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700" />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-700 to-red-600 hover:scale-[1.02] transition-all disabled:opacity-50">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}