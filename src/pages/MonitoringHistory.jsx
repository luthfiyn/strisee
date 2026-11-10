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
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Riwayat Monitoring Sensor</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 mt-8">
        
        {/* TABEL LIST */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 md:grid-cols-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest p-4 md:px-8 bg-slate-50 border-b border-slate-100">
            <div className="col-span-2 md:col-span-2">Waktu Pembacaan</div>
            <div className="col-span-1 text-center">pH Tanah</div>
            <div className="col-span-1 text-center hidden md:block">Kelembaban Tanah</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 font-bold">Memuat riwayat...</div>
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
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Clock size={14} />
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
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                          <CheckCircle2 size={16} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                          <AlertTriangle size={16} />
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}

              {historyLogs.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-medium">Tidak ada data monitoring yang tersedia.</div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}