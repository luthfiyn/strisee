import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Supabase secara otomatis akan menangkap token dari URL (hash)
    // saat pengguna diarahkan kembali dari email.
    // Kita bisa mengecek apakah user berhasil masuk dengan token tersebut.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage("Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.");
      }
    };
    
    // Hash URL dari email berisi access_token, kita minta supabase menguruskannya
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
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
      // Mengubah kata sandi untuk pengguna yang saat ini sedang login 
      // (yang loginnya dilakukan secara otomatis via tautan email)
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
    <main className="flex-grow flex items-center justify-center p-6 h-screen relative bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-slate-100">
        
        {!isSuccess ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Buat Sandi Baru</h1>
              <p className="text-slate-500 text-sm">
                Masukkan kata sandi baru untuk mengamankan kembali akun Strise Anda.
              </p>
            </div>

            {message && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-semibold border border-red-100">
                {message}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleUpdatePassword}>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Kata Sandi Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Minimal 6 karakter" 
                    required 
                    className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700" 
                  />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-700 to-red-600 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Sandi Baru'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-2">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Kata Sandi Diperbarui!</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Kata sandi akun Anda telah berhasil diubah. Sekarang Anda dapat mengakses kembali pemantauan kebun Anda.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-700 to-red-600 hover:scale-[1.02] transition-all mt-4 flex items-center justify-center gap-2"
            >
              <span>Pergi ke Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}