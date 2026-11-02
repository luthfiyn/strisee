import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LogOut, User, Mail, Phone } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          email: user.email,
          fullName: user.user_metadata?.full_name || "Petani",
          phone: user.user_metadata?.phone_number || "-"
        });
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <main className="pt-24 md:pt-28 pb-32 px-4 md:px-8 max-w-3xl mx-auto w-full">
      <div className="mb-10 mt-4 text-center">
        <h1 className="font-extrabold text-4xl text-slate-900 mb-2 tracking-tight">Profil Akun</h1>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-red-50 flex items-center justify-center mb-6 overflow-hidden">
          <img alt="User Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2bMsgt13WU2117YH2m24Ci8lMKaPRDvVQ8aeWiN-5EIfDNi27z266d5wq5RuCy77Amu87u2rKGBeeyDpLt8ZY_8a3U6mtbBxMJ1BfK2F91J5cN057PRrpmcEEFs2rGPYkErtdRcW3Qrrbs4h8WDHxHzi5lCjDhzOg0ShsiyHxxl1Br_6dBAp6fTZFACUuGQhmyyPLcMwUUI8iwKEeDEM90xFh9LNiV_6NpOQtHi0gQAggSMd9k01fp89pVPaYvKi_xK7qGiTnhVs" className="w-full h-full object-cover" />
        </div>
        
        {profile && (
          <div className="w-full space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <User className="text-slate-400" />
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Nama Lengkap</p>
                <p className="font-semibold text-slate-900">{profile.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Mail className="text-slate-400" />
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Email</p>
                <p className="font-semibold text-slate-900">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Phone className="text-slate-400" />
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Nomor Telepon</p>
                <p className="font-semibold text-slate-900">{profile.phone}</p>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleLogout} 
          className="mt-10 w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          Keluar (Logout)
        </button>
      </div>
    </main>
  );
}