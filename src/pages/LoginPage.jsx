import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
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
    if (error) {
      alert("Login Gagal: " + error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-6 h-screen">
      <div className="w-full max-w-md bg-white rounded-xl shadow-[0_32px_64px_-12px_rgba(25,28,30,0.06)] p-8 md:p-12 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang Kembali</h1>
          <p className="text-slate-500 text-sm">Akses dashboard perkebunan presisi Anda.</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={18} className="text-slate-400" /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="grower@strise.app" required className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700 focus:ring-opacity-20" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-900">Kata Sandi</label>
              <button type="button" className="text-sm font-medium text-red-700 hover:text-red-800 transition-colors">Lupa Kata Sandi?</button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700 focus:ring-opacity-20" />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm font-bold text-white bg-gradient-to-r from-red-700 to-red-600 hover:bg-red-800 transition-all duration-200 disabled:opacity-50">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">Baru di Strise? <button onClick={() => navigate('/register')} className="font-bold text-red-700 hover:text-red-800 ml-1">Minta Akses</button></p>
        </div>
      </div>
    </main>
  );
}