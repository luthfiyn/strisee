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
        .order('timestamp', { ascending: false })
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
      time: date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
      }),
      date: date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        timeZone: 'UTC'
      })
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
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Riwayat Monitoring</h1>
        </div>
      </header>

      <main className="pt-24 md:pt-28 pb-12 px-3 md:pl-72 md:pr-8 w-full min-h-screen">
        
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden max-w-5xl mx-auto">
          <div className="grid grid-cols-5 text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest p-3 md:px-8 bg-slate-50 border-b border-slate-100 gap-1 md:gap-4">
            <div className="col-span-2">Waktu</div>
            <div className="col-span-1 text-center">pH</div>
            <div className="col-span-1 text-center">Kelembaban</div>
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
                const fmtDate = formatTime(log.timestamp); 

                return (
                  <div key={log.id} className="grid grid-cols-5 items-center p-3 md:px-8 hover:bg-slate-50/50 transition-colors gap-1 md:gap-4 border-b border-slate-50 last:border-none">
                    
                    <div className="col-span-2 flex items-center gap-2 md:gap-3">
                      <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Clock size={14} className="md:w-4 md:h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-slate-900 text-xs md:text-sm">{fmtDate.time}</span>
                          <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase">WIB</span>
                        </div>
                        <span className="text-[9px] md:text-xs text-slate-500 font-medium">{fmtDate.date}</span>
                      </div>
                    </div>

                    <div className="col-span-1 text-center flex flex-col items-center justify-center">
                      <span className={`font-bold text-xs md:text-sm ${phOk ? 'text-teal-700' : 'text-amber-700'}`}>
                        {log.ph_value?.toFixed(1)}
                      </span>
                    </div>

                    <div className="col-span-1 text-center flex items-center justify-center">
                      <span className={`font-bold text-xs md:text-sm ${mstOk ? 'text-slate-900' : 'text-amber-700'}`}>
                        {log.moisture_value?.toFixed(0)}%
                      </span>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      {isOk ? (
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                          <CheckCircle2 size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                          <AlertTriangle size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
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
                  <p className="text-slate-500 font-bold text-sm">Tidak ada data monitoring yang tersedia.</p>
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