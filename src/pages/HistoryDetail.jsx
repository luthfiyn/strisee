import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Circle, Icon, CheckCircle2, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { strawberry } from '@lucide/lab';
import { supabase } from '../supabaseClient';
import { DISEASE_IMAGES } from './DiagnosticResult'; 

export default function HistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isHandled, setIsHandled] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [openAccordionId, setOpenAccordionId] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('disease_histories')
          .select('*, disease_catalogs(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setDetail(data);
        setIsHandled(data.is_handled || false);
      } catch (err) {
        console.error("Gagal memuat detail riwayat:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const toggleStatus = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('disease_histories')
        .update({ is_handled: !isHandled })
        .eq('id', id);

      if (error) throw error;
      setIsHandled(!isHandled); 
    } catch (err) {
      console.error("Gagal mengupdate status:", err.message);
      alert("Gagal merubah status! Pastikan Policy UPDATE di Supabase sudah aktif.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Yakin ingin menghapus riwayat diagnosa ini secara permanen?");
    if (!confirmDelete) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('disease_histories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      navigate('/history', { replace: true }); 
    } catch (err) {
      console.error("Gagal menghapus riwayat:", err.message);
      alert("Gagal menghapus data! Pastikan Policy DELETE di Supabase sudah aktif.");
      setUpdating(false);
    }
  };

  const toggleAccordion = (accordionId) => {
    setOpenAccordionId(openAccordionId === accordionId ? null : accordionId);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Memuat detail...</div>;
  if (!detail) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-red-500">Data tidak ditemukan.</div>;

  const result = detail.disease_catalogs;
  const displayImage = detail.image_data || (DISEASE_IMAGES && DISEASE_IMAGES[result?.id] ? DISEASE_IMAGES[result?.id] : 'https://cs-assets.bayer.com/is/image/bayer/TP-2024012705');
  const isOriginalPhoto = Boolean(detail.image_data);

  const multipleDetections = detail.detection_details || [];
  
  const groupedDetections = multipleDetections.reduce((acc, curr) => {
    if (!acc[curr.classId] || acc[curr.classId].confidence < curr.confidence) {
      acc[curr.classId] = curr;
    }
    return acc;
  }, {});

  const uniqueDiseasesList = Object.values(groupedDetections).sort((a, b) => b.confidence - a.confidence);

  const progressBarColors = [
    'from-rose-500 to-orange-400',
    'from-blue-600 to-cyan-400',
    'from-emerald-500 to-lime-400',
    'from-indigo-600 to-purple-500',
    'from-teal-500 to-cyan-400',
    'from-red-600 to-rose-500',
    'from-fuchsia-600 to-pink-500'
  ];

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
      <header className="absolute top-0 w-full z-50 flex justify-between items-center p-6">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-full shadow-lg text-slate-900 active:scale-95">
          <ArrowLeft size={24} />
        </button>
      </header>
      
      <section className={`relative w-full h-[45vh] md:h-[65vh] min-h-[400px] ${isOriginalPhoto ? 'bg-slate-900' : 'bg-slate-200'} rounded-br-[4rem] md:rounded-br-[6rem] overflow-hidden flex items-center justify-center`}>
        <img 
          alt="Penyakit Tanaman" 
          className={`w-full h-full object-contain object-center transition-all ${isHandled ? 'grayscale opacity-75' : ''}`} 
          src={displayImage} 
          onError={(e) => { e.target.src = 'https://cs-assets.bayer.com/is/image/bayer/TP-2024012705'; }} 
        />
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${isOriginalPhoto ? 'to-slate-900/80' : 'to-black/60'}`}></div>
      </section>
      
      <main className="relative z-10 -mt-24 md:-mt-32 px-6 md:px-12 max-w-4xl mx-auto">
        
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 border border-slate-100 flex items-start justify-between gap-4">
          <div className="flex flex-col items-start flex-1 pr-2">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1 block">Diagnosis Utama</span>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
              {result?.name || "Penyakit"}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-xs font-bold ${isHandled ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
              {isHandled ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {isHandled ? 'Penyakit Sudah Ditangani' : 'Tindakan Diperlukan'}
            </span>
          </div>
          
          <div className="flex flex-col items-center bg-red-50 text-red-800 px-4 py-3 md:px-5 md:py-4 rounded-2xl shrink-0 min-w-[80px] md:min-w-[100px]">
            <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold mb-1 opacity-80 text-center">Akurasi<br/>AI</span>
            <span className="text-2xl md:text-3xl font-bold leading-none">{(detail.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* PROGRESS BAR & ACCORDION */}
        {uniqueDiseasesList.length > 0 ? (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                {uniqueDiseasesList.length}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                Penyakit Terdeteksi
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {uniqueDiseasesList.map((disease, idx) => {
                const accPercentage = (disease.confidence * 100).toFixed(0);
                const gradClass = progressBarColors[idx % progressBarColors.length];
                const isOpen = openAccordionId === disease.classId;

                return (
                  <div key={disease.classId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <button 
                      onClick={() => toggleAccordion(disease.classId)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-800 text-sm md:text-base">{disease.diseaseName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex-1 h-3 md:h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
                             <div 
                               className={`h-full bg-gradient-to-r ${gradClass} rounded-full transition-all duration-1000 ease-out`}
                               style={{ width: `${accPercentage}%` }}
                             ></div>
                           </div>
                           <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br ${gradClass} flex items-center justify-center text-white text-[10px] md:text-xs font-bold shadow-sm shrink-0`}>
                             {accPercentage}%
                           </div>
                        </div>
                      </div>
                      
                      <div className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </button>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-5 bg-slate-50/50 flex flex-col gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                             <Circle size={16} className="text-red-500 fill-red-100" />
                             <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Indikasi Gejala</h4>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed pl-6 whitespace-pre-line">
                            {disease.symptoms || "Data gejala tidak tersedia."}
                          </p>
                        </div>
                        
                        <div>
                           <div className="flex items-center gap-2 mb-2">
                             <Icon iconNode={strawberry} className="w-4 h-4 text-teal-600" />
                             <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Rencana Penanganan</h4>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed pl-6 whitespace-pre-line">
                            {disease.treatment || "Data penanganan tidak tersedia."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          
          <>
            <section className="mb-14">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Indikasi Gejala</h2>
              <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-1"><Circle size={20} /></div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{result?.symptoms}</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Rekomendasi Penanganan Utama</h2>
              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 text-teal-700 mt-1">
                  <Icon iconNode={strawberry} className="w-5 h-5" />
                </div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{result?.treatment}</p>
              </div>
            </section>
          </>
        )}

        <section className="mt-8 mb-4 border-t border-slate-200 pt-8 flex flex-col gap-3">
          <button 
            onClick={toggleStatus} 
            disabled={updating}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-sm active:scale-[0.98] ${
              isHandled 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20 shadow-lg'
            }`}
          >
            {updating ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isHandled ? (
              <ArrowLeft size={20} className="rotate-180" />
            ) : (
              <CheckCircle2 size={24} />
            )}
            {updating ? 'Memproses...' : isHandled ? 'Batalkan Status Penanganan' : 'Tandai Sudah Ditangani'}
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={updating}
            className="w-full py-4 px-6 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-3 bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-sm active:scale-[0.98]"
          >
            <Trash2 size={20} />
            Hapus Riwayat Ini
          </button>
        </section>

      </main>
    </div>
  );
}