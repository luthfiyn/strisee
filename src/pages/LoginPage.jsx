import React, { useState } from 'react';
import { User, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LoginPage() {
  const navigate = useNavigate();
  // State ini sekarang menampung Email ATAU Nomor Telepon
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fungsi untuk mengecek apakah inputan adalah nomor telepon atau email
  const isPhoneNumber = (text) => {
    // Menghapus semua karakter kecuali angka dan '+'
    const cleanText = text.replace(/[^\d+]/g, '');
    // Jika sisa karakternya cukup panjang dan hanya berisi angka/+, anggap ini nomor telepon
    return cleanText.length >= 10 && /^[0-9+]+$/.test(cleanText);
  };

  // Fungsi untuk memformat nomor '08...' menjadi '+628...' standar Supabase
  const formatPhone = (phone) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      return '+62' + clean.substring(1);
    }
    if (!clean.startsWith('62') && !clean.startsWith('+')) {
      return '+62' + clean;
    }
    return '+' + clean;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    let loginData = { password };

    // Deteksi cerdas: Apakah user memasukkan Email atau No. Telepon?
    if (isPhoneNumber(identifier)) {
      loginData.phone = formatPhone(identifier);
    } else {
      loginData.email = identifier;
    }

    const { error } = await supabase.auth.signInWithPassword(loginData);
    
    setLoading(false);
    
    if (error) {
      setErrorMsg("Login Gagal: Pastikan data atau sandi yang dimasukkan benar.");
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-6 h-screen relative bg-slate-50">
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center space-x-2 text-slate-500 hover:text-red-700 transition-colors group z-10">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm uppercase tracking-widest font-semibold">Kembali</span>
      </button>

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang</h1>
          <p className="text-slate-500 text-sm">Akses dashboard perkebunan presisi Anda.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-semibold border border-red-100">
            {errorMsg}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            {/* Label diperbarui untuk mencerminkan dua fungsi */}
            <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                placeholder="strise@gmail.com"
                required 
                className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700 placeholder-slate-400" 
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-900">Kata Sandi</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
              <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Masukkan kata sandi"
              required className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700" />
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm font-semibold text-red-600 hover:text-red-800">
              Lupa Kata Sandi?
            </button>
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