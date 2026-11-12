import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function MonitoringHistory() {
  const navigate = useNavigate();
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllHistory = async () => {
      const { data, error } = await supabase
        .from('sensor_logs') 
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); 
      
      if (data && !error) {
        setHistoryLogs(data);
      }
      setLoading(false);
    };
    
    fetchAllHistory();
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return { time: "--:--", date: "-" };
    const date = new Date(isoString);
    return {
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      
      <style>{`
        @media (min-width: 768px) {
          body { padding-left: 0 !important; }
        }
      `}</style>

      <header className="fixed top-0 left-0 md:left-64 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-900 transition-colors shrink-0 group"
          >
            <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Riwayat Monitoring Sensor</h1>
        </div>
      </header>

      <main className="pt-24 md:pt-28 pb-12 px-4 md:pl-72 md:pr-8 w-full min-h-screen">
        
        {/* TABEL LIST */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden max-w-5xl mx-auto">
          {/* Header Tabel */}
          <div className="grid grid-cols-4 md:grid-cols-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest p-4 md:px-8 bg-slate-50 border-b border-slate-100">
            <div className="col-span-2 md:col-span-2">Waktu Pembacaan</div>
            <div className="col-span-1 text-center">pH Tanah</div>
            <div className="col-span-1 text-center hidden md:block">Kelembaban Tanah</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <span className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mb-4"></span>
              <span className="text-slate-500 font-bold">Memuat riwayat...</span>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-50">
              {historyLogs.map((log) => {
                const phOk = log.ph_value >= 5.5 && log.ph_value <= 6.5;
                const mstOk = log.moisture_value >= 60 && log.moisture_value <= 80;
                const isOk = phOk && mstOk;
                const fmtDate = formatTime(log.created_at);

                return (
                  <div key={log.id} className="grid grid-cols-4 md:grid-cols-5 items-center p-4 md:px-8 hover:bg-slate-50/50 transition-colors">
                    
                    <div className="col-span-2 md:col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Clock size={16} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-slate-900 text-sm">{fmtDate.time}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">WIB</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{fmtDate.date}</span>
                      </div>
                    </div>

                    <div className="col-span-1 text-center flex flex-col items-center justify-center">
                      <span className={`font-bold text-sm ${phOk ? 'text-teal-700' : 'text-amber-700'}`}>
                        {log.ph_value?.toFixed(1)}
                      </span>
                    </div>

                    <div className="col-span-1 text-center hidden md:flex items-center justify-center">
                      <span className={`font-bold text-sm ${mstOk ? 'text-slate-900' : 'text-amber-700'}`}>
                        {log.moisture_value?.toFixed(0)}%
                      </span>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      {isOk ? (
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                          <CheckCircle2 size={16} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                          <AlertTriangle size={16} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}

              {historyLogs.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Clock size={28} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold">Tidak ada data monitoring yang tersedia.</p>
                  <p className="text-xs text-slate-400 mt-1">Data akan muncul setelah sensor mulai merekam.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}