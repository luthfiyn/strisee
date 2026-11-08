import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Microscope, ShieldAlert, Radio, TrendingUp } from 'lucide-react';
import imgLandingPage from '../assets/img_landingpage.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
      <section className="relative bg-slate-100 rounded-xl overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="p-8 md:p-16 md:w-1/2 z-10">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tighter mb-6">
            Rawat <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500">Stroberi</span> <br/>
            dengan Kecerdasan Buatan.
          </h1>
          <p className="text-slate-600 text-lg md:text-xl mb-8 max-w-md">
            Lindungi kebun Anda melalui deteksi penyakit dini dan pemantauan tanah real-time. Solusi cerdas untuk hasil panen yang lebih maksimal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-red-700 to-red-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:-translate-y-1 transition-all"
            >
              Coba Strise Sekarang
            </button>
            <button 
              onClick={() => navigate('/learn-more')}
              className="bg-teal-100 text-teal-800 font-bold text-lg px-8 py-4 rounded-xl hover:bg-teal-200 transition-all"
            >
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
        <div className="md:w-1/2 h-96 md:h-auto relative min-h-[500px] w-full">
          <img alt="Lush red strawberries on a vine" className="absolute inset-0 w-full h-full object-cover rounded-l-[4rem] md:rounded-l-[8rem] rounded-r-xl shadow-[-32px_0_64px_-12px_rgba(25,28,30,0.08)]" src={imgLandingPage}/>
          <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <Droplet className="text-teal-700" size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Kelembapan Tanah</p>
              <p className="text-2xl font-black text-teal-700">Optimal</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-200 p-8 rounded-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Microscope size={64} className="text-red-700" />
          </div>
          <div className="w-14 h-14 rounded-xl bg-red-600 text-white flex items-center justify-center mb-6">
            <ShieldAlert size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Deteksi Dini</h3>
          <p className="text-slate-600 text-sm">Pindai daun atau buah stroberi untuk mendeteksi indikasi penyakit dan hama lebih awal sebelum menyebar luas.</p>
        </div>
        <div className="bg-slate-100 p-8 rounded-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Radio size={64} className="text-teal-700" />
          </div>
          <div className="w-14 h-14 rounded-xl bg-teal-200 text-teal-800 flex items-center justify-center mb-6">
            <Radio size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Monitoring Kebun Stroberi</h3>
          <p className="text-slate-600 text-sm">Pantau pH dan kelembapan tanah secara real-time untuk memastikan lingkungan tumbuh yang paling ideal.</p>
        </div>
        <div className="bg-slate-200 p-8 rounded-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} className="text-amber-700" />
          </div>
          <div className="w-14 h-14 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center mb-6">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Prediksi Hasil Panen</h3>
          <p className="text-slate-600 text-sm">Dapatkan rekomendasi penanganan dan wawasan berbasis data untuk menjaga kualitas tanaman Anda.</p>
        </div>
      </section>
    </div>
  );
}