import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Mohon masukkan alamat email Anda.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      setMessage('Tautan pemulihan kata sandi telah dikirim ke email Anda. Silakan cek kotak masuk atau folder spam.');
    } catch (error) {
      console.error('Error saat mereset password:', error);
      setErrorMsg(error.message || 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      
      <div className="absolute top-6 left-6 z-10">
        <Link 
          to="/login" 
          className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md text-slate-700 hover:text-red-600 hover:shadow-lg transition-all active:scale-95 border border-slate-100"
        >
          <ArrowLeft size={24} />
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-4 shadow-sm border border-red-100">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Lupa Kata Sandi?
          </h2>
          <p className="mt-3 text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Masukkan alamat email yang terdaftar, kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
          </p>
        </div>

        <div className="bg-white py-8 px-6 md:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          
          {isSuccess ? (
            <div className="text-center py-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 text-teal-600 mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Email Terkirim!</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {message}
              </p>
              <Link 
                to="/login"
                className="inline-flex justify-center w-full px-6 py-3.5 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Kembali ke Halaman Login
              </Link>
            </div>
          ) : (
            
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {errorMsg && (
                <div className="p-4 bg-red-50/80 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-start gap-3">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors"
                    placeholder="strise@gmail.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Mengirim...
                    </span>
                  ) : (
                    'Kirim Tautan'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-red-50/50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-50/50 blur-3xl pointer-events-none"></div>
    </div>
  );
}