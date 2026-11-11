import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage("Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru dari halaman Lupa Kata Sandi.");
      }
    };
    
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery event received");
      }
    });

    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return setMessage("Kata sandi minimal 6 karakter.");
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err) {
      setMessage("Gagal mengubah sandi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {!isSuccess ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-4 shadow-sm border border-red-100">
                <Lock size={32} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Buat Sandi Baru
              </h2>
              <p className="mt-3 text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Silakan masukkan kata sandi baru Anda. Pastikan kata sandi kuat dan mudah diingat.
              </p>
            </div>

            <div className="bg-white py-8 px-6 md:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
              {message && (
                <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-start gap-3">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{message}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleUpdatePassword}>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Minimal 6 karakter" 
                      required 
                      className="appearance-none block w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading || newPassword.length < 6} 
                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                    ) : (
                      'Simpan Sandi Baru'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="bg-white py-10 px-6 md:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-50 text-teal-600 mb-6 border border-teal-100 shadow-sm">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Kata Sandi Diperbarui!</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Kata sandi akun Anda telah berhasil diubah. Silakan gunakan kata sandi baru Anda untuk masuk ke akun Anda.
            </p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="w-full py-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
      
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-red-50/60 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-50/60 blur-3xl pointer-events-none"></div>
    </div>
  );
}