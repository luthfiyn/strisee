import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scan, Droplets, Leaf, ShieldCheck, Cpu } from 'lucide-react';
import imgKebun from '../assets/img_dashboard.jpg'; // Gunakan gambar kebun yang sudah ada

export default function LearnMorePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-32">
      
      {/* Header Sederhana */}
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Tentang Strise</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-8 md:mt-12">
        
        {/* HERO SECTION YANG LEBIH ORGANIK */}
        <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 mb-8 md:mb-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          
          {/* Teks Kiri */}
          <div className="flex-1 order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-bold tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              PROYEK TEKNOLOGI PERTANIAN
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Merawat Stroberi,<br/>
              <span className="text-red-700">Dibantu Kecerdasan Buatan.</span>
            </h2>
            
            <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-md">
              Strise hadir dari sebuah keresahan sederhana di kebun: betapa sulitnya mendeteksi penyakit daun sebelum ia menyebar luas. Kami menggabungkan kamera ponsel biasa dengan sensor tanah IoT untuk memberikan Anda asisten kebun digital yang bekerja 24 jam.
            </p>
            
          </div>

          {/* Gambar Kanan (Gaya Polaroid/Organik) */}
          <div className="w-full md:w-5/12 order-1 md:order-2 relative">
            {/* Dekorasi Latar */}
            <div className="absolute inset-0 bg-red-100 rounded-[3rem] rotate-6 transform scale-105 -z-10"></div>
            
            <div className="aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white relative group">
              <img src={imgKebun} alt="Kebun Stroberi" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Cakupan Proteksi</p>
                  <p className="font-bold text-slate-900">7 Penyakit Kritis</p>
                </div>
                <ShieldCheck className="text-teal-600" size={24} />
              </div>
            </div>
          </div>
        </section>


        {/* FITUR UTAMA (Cards yang Lebih Santai) */}
        <section className="mb-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Bagaimana Strise Bekerja?</h3>
            <p className="text-slate-500 max-w-lg mx-auto">Bukan sekadar aplikasi pencatat. Ini adalah ekosistem pemantauan mandiri untuk lahan Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Kartu 1: AI */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform group">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scan size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Mata Digital YOLOv12</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Arahkan kamera ke daun atau buah yang mencurigakan. Tanpa perlu koneksi internet berkecepatan tinggi, model AI lokal di dalam aplikasi akan langsung mengenali spora dan bercak penyakit.
              </p>
            </div>

            {/* Kartu 2: IoT */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform group">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Sensor Tanah Real-time</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Perangkat keras di lahan mengirimkan data kelembaban dan keasaman (pH) tanah langsung ke genggaman Anda. Akar stroberi tidak akan pernah lagi kekeringan tanpa sepengetahuan Anda.
              </p>
            </div>

            {/* Kartu 3: Agronomi */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform group">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Leaf size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Panduan Penanganan</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tidak dibiarkan bingung setelah deteksi. Strise memberikan panduan dosis kapur dolomit dan takaran hayati yang terstruktur agar panen Anda bisa segera diselamatkan.
              </p>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}