import React, { useState } from 'react';
import { Phone, KeyRound, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  // State: 'request' (Minta OTP) -> 'reset' (Masukkan OTP & Sandi Baru)
  const [step, setStep] = useState('request'); 
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 0 && val[0] !== '0') val = '0' + val;
    if (val.length > 1 && val[1] !== '8') val = '08' + val.substring(2);
    setPhone(val);
  };

  const formatPhoneForSupabase = () => '+62' + phone.substring(1);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return setMessage("Nomor telepon tidak valid.");
    
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithOtp({
      phone: formatPhoneForSupabase(),
    });
    
    setLoading(false);
    
    if (error) {
      setMessage("Gagal mengirim OTP: " + error.message);
    } else {
      setMessage("Kode OTP telah dikirim melalui SMS/WhatsApp.");
      setStep('reset');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setMessage("Kata sandi baru minimal 6 karakter.");
    
    setLoading(true);
    setMessage('');
    
    try {
      // 1. Verifikasi OTP dari SMS
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: formatPhoneForSupabase(),
        token: otp,
        type: 'sms'
      });
      if (verifyError) throw verifyError;

      // 2. Jika OTP benar, ubah kata sandi
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (updateError) throw updateError;

      alert("Kata sandi berhasil diubah! Silakan masuk kembali.");
      navigate('/login');
    } catch (err) {
      setMessage("Gagal mereset sandi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-6 h-screen relative bg-slate-50">
      <button onClick={() => navigate('/login')} className="absolute top-8 left-8 flex items-center space-x-2 text-slate-500 hover:text-red-700 transition-colors group z-10">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm uppercase tracking-widest font-semibold">Kembali ke Login</span>
      </button>

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Pemulihan Akun</h1>
          <p className="text-slate-500 text-sm">
            {step === 'request' ? 'Masukkan nomor telepon terdaftar Anda.' : 'Masukkan kode OTP dan sandi baru Anda.'}
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border ${message.includes('Gagal') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>
            {message}
          </div>
        )}

        {step === 'request' ? (
          <form className="space-y-6" onSubmit={handleRequestOtp}>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Nomor Telepon (08...)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={18} className="text-slate-400" /></div>
                <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="08xxxxxxxxxx" required className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700" />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-700 to-red-600 hover:scale-[1.02] transition-all disabled:opacity-50">
                {loading ? 'Memproses...' : 'Kirim Kode OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Kode OTP dari SMS</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound size={18} className="text-slate-400" /></div>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6} placeholder="Masukkan 6 angka OTP" required className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700 tracking-[0.2em] font-bold" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Buat Kata Sandi Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" required className="block w-full pl-10 pr-3 py-3 bg-slate-100 border-0 rounded-md text-slate-900 focus:ring-2 focus:ring-red-700" />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-700 to-red-600 hover:scale-[1.02] transition-all disabled:opacity-50">
                {loading ? 'Menyimpan...' : 'Simpan Sandi Baru'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}