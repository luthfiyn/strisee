import React, { useState, useEffect } from 'react';
import { Droplet, FlaskConical, AlertCircle, CheckCircle2, ChevronRight, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSensor } from '../context/SensorContext'; 
import { supabase } from '../supabaseClient';
import gambarMonitoring from '../assets/img_monitoring.jpg';

export default function Monitoring() {
  const navigate = useNavigate();
  const { sensor } = useSensor();
  const [historyLogs, setHistoryLogs] = useState([]);
  const [showFullGuide, setShowFullGuide] = useState(false);

  // Fetch data riwayat dari Supabase
  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('sensor_logs') 
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (data && !error) {
        setHistoryLogs(data);
      }
    };
    
    fetchHistory();

    const subscription = supabase
      .channel('public:sensor_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_logs' }, (payload) => {
        setHistoryLogs((current) => [payload.new, ...current].slice(0, 4));
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const isPhOptimal = sensor.ph_value >= 5.5 && sensor.ph_value <= 6.5;
  const isMoistureOptimal = sensor.moisture_value >= 60 && sensor.moisture_value <= 80;
  
  const requireAttention = !isPhOptimal || !isMoistureOptimal;

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getPhRecommendation = (ph) => {
    if (ph >= 5.5 && ph <= 6.5) {
      return null;
    }

    if (ph < 5.5) {
      return {
        status: `Tanah Terlalu Asam (pH < 5,5)`,
        title: 'Beri Kapur Dolomit',
        badgeClass: 'bg-amber-50 border-amber-100 text-amber-700',
        desc: 'Untuk skala polybag/pot, cukup taburkan 1 – 2 sendok makan (15–30 gram) per polybag lalu siram sedikit air. Diamkan selama 1 hingga 2 minggu agar pH bereaksi naik sebelum pemupukan berikutnya.',
        guideTitle: '• Jika Tanah Terlalu Asam (pH < 5,5) — Beri Kapur Dolomit:',
        guideDesc: 'Untuk skala polybag/pot, cukup taburkan 1 – 2 sendok makan (15–30 gram) per polybag lalu siram sedikit air. Diamkan selama 1 hingga 2 minggu agar pH bereaksi naik sebelum pemupukan berikutnya.'
      };
    }
    
    if (ph > 6.5) {
      return {
        status: `Tanah Terlalu Basa (pH > 7,0)`,
        title: 'Beri Bubuk Belerang (Sulfur)',
        badgeClass: 'bg-amber-50 border-amber-100 text-amber-700',
        desc: 'Untuk skala polybag, cukup berikan 1 sendok teh (sekitar 5 gram) per polybag.',
        guideTitle: '• Jika Tanah Terlalu Basa (pH > 7,0) — Beri Bubuk Belerang (Sulfur):',
        guideDesc: 'Untuk skala polybag, cukup berikan 1 sendok teh (sekitar 5 gram) per polybag.'
      };
    }

    return null;
  };

  const currentPhRec = getPhRecommendation(sensor.ph_value);
  const isMoistureHigh = sensor.moisture_value > 80;

  return (
    <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto w-full pb-32">
      
      <section className="mb-8 relative rounded-3xl overflow-hidden bg-slate-200 min-h-[200px] flex items-end p-6" style={{backgroundImage: `linear-gradient(to top, rgba(248,249,251,1) 0%, rgba(248,249,251,0.2) 100%), url('${gambarMonitoring}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-bold">Sektor Alpha</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Pemantau Lingkungan</h2>
        </div>
        {requireAttention && (
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full shadow flex items-center gap-2 transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-900">Tindakan Diperlukan</span>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-10">
        <div className="md:col-span-7 bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[220px] shadow-sm border border-slate-100 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="text-teal-700" size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Tren Kelembaban</h3>
              </div>
              <p className={`text-sm font-medium transition-colors ${isMoistureOptimal ? "text-teal-700" : "text-amber-700"}`}>
                {isMoistureOptimal ? "Kondisi Ideal (60 - 80%)" : "Batas Kritis (60 - 80%)"}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex items-end justify-between w-full">
            <div className="flex items-baseline transition-all duration-500">
              <span className={`text-6xl md:text-7xl font-extrabold tracking-tighter ${isMoistureOptimal ? "text-slate-900" : "text-amber-600"}`}>
                {sensor.moisture_value.toFixed(0)}
              </span>
              <span className="text-2xl font-bold text-slate-400 ml-1">%</span>
            </div>
            
            <div className="flex items-end gap-1.5 md:gap-2 h-12 pb-1 md:pb-2 opacity-80">
              <div className="w-4 h-4 md:w-5 bg-slate-100 rounded-[3px]"></div>
              <div className="w-4 h-6 md:w-5 bg-slate-100 rounded-[3px]"></div>
              <div className="w-4 h-8 md:w-5 bg-slate-100 rounded-[3px]"></div>
              <div className={`w-5 h-12 md:w-6 rounded-[3px] shadow-sm ${isMoistureOptimal ? 'bg-teal-600' : 'bg-amber-500'}`}></div>
              <div className="w-4 h-9 md:w-5 bg-slate-100 rounded-[3px]"></div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-5 bg-slate-100 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden group border border-slate-200 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical className={isPhOptimal ? "text-teal-700" : "text-amber-700"} size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">pH Tanah</h3>
              </div>
              <p className={`text-sm font-medium transition-colors ${isPhOptimal ? "text-teal-700" : "text-amber-700"}`}>
                {isPhOptimal ? "Kondisi Ideal (5.5 - 6.5)" : "Batas Kritis (5.5 - 6.5)"}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 transition-all duration-500 flex flex-col w-full mt-2">
            <div className="flex items-baseline mb-3">
              <span className={`text-6xl md:text-7xl font-extrabold tracking-tighter ${isPhOptimal ? "text-slate-900" : "text-amber-600"}`}>
                {sensor.ph_value.toFixed(1)}
              </span>
            </div>
            
            <div className="w-full">
              <div className="h-2 w-full bg-slate-200/80 rounded-full relative">
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${isPhOptimal ? 'bg-teal-600' : 'bg-amber-500'}`}
                  style={{ width: `${Math.max(0, Math.min(100, ((sensor.ph_value - 4) / 4) * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>4.0</span>
                <span>5.5</span>
                <span>8.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {requireAttention && (
        <section className="mb-12 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={24} /> 
              Notifikasi & Rekomendasi
            </h3>
            <button 
              onClick={() => setShowFullGuide(!showFullGuide)}
              className="text-xs font-bold text-red-700 hover:underline flex items-center gap-1"
            >
              <span>{showFullGuide ? 'Sembunyikan Panduan Lengkap' : 'Lihat Panduan Lengkap'}</span>
              <ChevronDown size={16} className={`transition-transform ${showFullGuide ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className={`grid gap-6 ${(!isPhOptimal && !isMoistureOptimal) ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            
            {!isPhOptimal && currentPhRec && (
              <div className="bg-red-50/50 rounded-[2rem] p-6 shadow-sm border border-red-100 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 shadow-sm">
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Penanganan pH Kritis</p>
                      <h4 className="font-bold text-base text-slate-900 leading-tight">{currentPhRec.title}</h4>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full border text-[11px] font-bold shadow-sm bg-white self-start sm:self-center ${currentPhRec.badgeClass}`}>
                    {currentPhRec.status}
                  </span>
                </div>

                {!showFullGuide ? (
                  <p className="text-sm text-slate-700 leading-relaxed font-medium mt-1">{currentPhRec.desc}</p>
                ) : (
                  <div className="flex flex-col gap-3 text-sm text-slate-700 leading-relaxed pt-3 border-t border-red-100/50 mt-1">
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">{currentPhRec.guideTitle}</span>
                      {currentPhRec.guideDesc}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isMoistureOptimal && (
              <div className="bg-amber-50/50 rounded-[2rem] p-6 shadow-sm border border-amber-100 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-sm">
                      <Droplet size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Penanganan Kelembaban</p>
                      <h4 className="font-bold text-base text-slate-900 leading-tight">
                        {isMoistureHigh ? 'Mitigasi Tanah Becek / Lembap' : 'Lakukan Penyiraman'}
                      </h4>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full border text-[11px] font-bold shadow-sm bg-white self-start sm:self-center ${isMoistureHigh ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                    {isMoistureHigh ? 'Kelembaban Sangat Tinggi' : 'Kelembaban Rendah'}
                  </span>
                </div>

                {isMoistureHigh ? (
                  <>
                    {!showFullGuide ? (
                      <p className="text-xs font-semibold text-amber-900 bg-amber-100/50 border border-amber-200/50 rounded-xl p-3 leading-relaxed mt-1">
                        Tanah yang becek atau kelembabannya terus-menerus di atas 90% akan membuat akar kekurangan oksigen dan memicu jamur busuk akar (Phytophthora) serta busuk buah.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3 text-sm text-slate-700 leading-relaxed font-medium mt-1">
                        <p className="text-xs font-semibold text-amber-900 bg-amber-100/50 border border-amber-200/50 rounded-xl p-3 leading-relaxed">
                          Tanah yang becek atau kelembabannya terus-menerus di atas 90% akan membuat akar kekurangan oksigen dan memicu jamur busuk akar (Phytophthora) serta busuk buah.
                        </p>
                        <div className="pt-2">
                          <span className="font-bold text-slate-900">• Hentikan Penyiraman Total: </span>
                          Segera hentikan jadwal penyiraman rutin hingga angka pada soil moisture meter kembali turun ke kisaran ideal 70 – 85%.
                        </div>
                        <div className="pt-2 border-t border-amber-200/30">
                          <span className="font-bold text-slate-900 block mb-1">• Perdalam Parit dan Tambah Lubang Drainase: </span>
                          Untuk lahan bedengan, perdalam saluran parit di antara bedengan menjadi 30 – 40 cm agar air cepat tuntas mengalir keluar kebun. Untuk sistem polybag, tambah lubang pembuangan di bagian bawah dan samping plastik, lalu beri ganjalan batu bata atau kayu di bawah polybag agar tidak menempel langsung ke tanah basah.
                        </div>
                        <div className="pt-2 border-t border-amber-200/30">
                          <span className="font-bold text-slate-900 block mb-1">• Gemburkan dan Campur Media Poros: </span>
                          Tusuk-tusuk permukaan tanah di sekitar tanaman secara perlahan menggunakan garpu taman kecil untuk membuka jalur udara (aerasi). Jika media tanam terlalu padat dan menahan air, campurkan sekam bakar atau pasir kasar ke lapisan atas media (perbandingan ideal media stroberi adalah tanah, kompos, dan sekam sebesar 1 : 1 : 2).
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed font-medium mt-1">
                    Tanah terlalu kering (di bawah 60%). Segera lakukan penyiraman secukupnya pada area zona perakaran (tajuk) hingga kelembaban kembali mencapai target ideal 70-80%.
                  </p>
                )}
              </div>
            )}
            
          </div>
        </section>
      )}

      {!requireAttention && (
        <section className="mb-12 flex justify-start animate-in fade-in duration-500">
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-6 py-4 flex items-center gap-4 max-w-2xl shadow-sm">
            <CheckCircle2 className="text-teal-600 shrink-0" size={24} />
            <span className="text-sm font-bold text-teal-800 leading-relaxed">Kondisi lahan saat ini terpantau optimal. Tidak ada rekomendasi penanganan yang mendesak untuk dilakukan.</span>
          </div>
        </section>
      )}

      <section className="mb-8">
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
          
          <div className="grid grid-cols-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-50">
            <div className="col-span-1">WAKTU</div>
            <div className="col-span-1 text-center">PH TANAH</div>
            <div className="col-span-1 text-center">KELEMBABAN</div>
            <div className="col-span-1 text-right">STATUS</div>
          </div>

          <div className="flex flex-col">
            {historyLogs.map((log, idx) => {
              const phOk = log.ph_value >= 5.5 && log.ph_value <= 6.5;
              const mstOk = log.moisture_value >= 60 && log.moisture_value <= 80;
              const isOk = phOk && mstOk;

              return (
                <div key={log.id || idx} className="grid grid-cols-4 items-center py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  
                  <div className="col-span-1 flex items-center gap-2">
                    <Clock size={16} className="text-amber-800/60" />
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-slate-900 text-sm">{formatTime(log.created_at)}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">WIB</span>
                    </div>
                  </div>

                  <div className="col-span-1 text-center flex flex-col items-center">
                    <span className={`font-bold text-sm ${phOk ? 'text-teal-700' : 'text-amber-700'}`}>
                      {log.ph_value?.toFixed(1)}
                    </span>
                    {!phOk && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded mt-0.5">
                        {log.ph_value < 5.5 ? 'Rendah' : 'Tinggi'}
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 text-center">
                    <span className="font-bold text-sm text-slate-900">{log.moisture_value?.toFixed(0)}%</span>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    {isOk ? (
                      <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-full text-[11px] font-bold">
                        <CheckCircle2 size={12} /> Optimal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-[11px] font-bold">
                        <AlertTriangle size={12} /> Perhatian
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {historyLogs.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-medium text-sm">
                Belum ada data sensor tercatat hari ini.
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Menampilkan {historyLogs.length} pembacaan terbaru</span>
            <button onClick={() => navigate('/monitoring/history')} className="text-red-700 font-bold text-sm flex items-center gap-1 hover:text-red-800 group transition-colors">
              Lihat Selengkapnya <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}