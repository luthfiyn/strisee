import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, FlaskConical, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Monitoring() {
  const navigate = useNavigate();
  const [sensor, setSensor] = useState({ ph_value: 6.5, moisture_value: 70 });
  const [alerts, setAlerts] = useState([]); // State khusus untuk Notifikasi dari DB

  useEffect(() => {
    // Tarik data metrik sensor
    const fetchLatest = async () => {
      const { data } = await supabase.from('sensor_logs').select('*').order('timestamp', { ascending: false }).limit(1);
      if (data?.length > 0) setSensor(data[0]);
    };
    
    // Tarik data notifikasi yang belum dibaca pekerja
    const fetchAlerts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_notifications')
          .select(`id, is_read, notifications(type, message, created_at)`)
          .eq('user_id', user.id)
          .eq('is_read', false)
          .order('id', { ascending: false });
        if (data) setAlerts(data);
      }
    };

    fetchLatest();
    fetchAlerts();

    // Subscribe realtime untuk sensor
    const sensorChannel = supabase.channel('monitoring_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_logs' }, (payload) => setSensor(payload.new))
      .subscribe();
      
    // Subscribe realtime untuk notifikasi baru masuk
    const alertChannel = supabase.channel('alert_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, () => fetchAlerts())
      .subscribe();

    return () => {
      supabase.removeChannel(sensorChannel);
      supabase.removeChannel(alertChannel);
    };
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    // Ubah status is_read di database
    await supabase.from('user_notifications').update({ is_read: true, read_at: new Date() }).eq('id', notificationId);
    // Hapus dari tampilan layar
    setAlerts(alerts.filter(alert => alert.id !== notificationId));
  };

  const isPhOptimal = sensor.ph_value >= 5.5 && sensor.ph_value <= 6.5;
  const isMoistureOptimal = sensor.moisture_value >= 60 && sensor.moisture_value <= 80;
  const requireAttention = alerts.length > 0 || !isPhOptimal || !isMoistureOptimal;

  return (
    <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto w-full pb-32">
      <section className="mb-8 relative rounded-3xl overflow-hidden bg-slate-200 min-h-[200px] flex items-end p-6" style={{backgroundImage: "linear-gradient(to top, rgba(248,249,251,1) 0%, rgba(248,249,251,0.2) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfsiDmHd33-mf5gwJrlnnT5XGl7NM17S8t25jYvIo6v-teEKngawTmYH6pcyOmYx8gXVkceG4FiyVUMBbb2MM9I-WfQXrtj37R1ZqpofwiTnHqAOGj-T-uSSXe4SjQmFRyiyeonLHE_IF1JDvRlZB_MIEMk_OX4XMucSbqta8gVz3JIlZ_sPgz0ZbLHCtkzG_H9LfvFV_x88F6E-mNK07MbYqxKTgVORPgdzPF1V_i8K2kRhleNs84u-3LRpCBTdQ0yHiImhuzWag')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-bold">Sektor Alpha</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Pemantau Lingkungan</h2>
        </div>
        {requireAttention && (
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full shadow flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-900">Perhatian Diperlukan</span>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-10">
        <div className="md:col-span-7 bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[220px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="text-teal-700" size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Tren Kelembaban</h3>
              </div>
              <p className={`text-sm font-medium ${isMoistureOptimal ? "text-teal-700" : "text-amber-700"}`}>
                {isMoistureOptimal ? "Tingkat Optimal" : "Di Luar Target (60 - 80%)"}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <div className="flex items-baseline">
              <span className={`text-6xl md:text-7xl font-extrabold tracking-tighter ${isMoistureOptimal ? "text-slate-900" : "text-amber-600"}`}>
                {sensor.moisture_value.toFixed(0)}
              </span>
              <span className="text-2xl font-bold text-slate-400 ml-1">%</span>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-5 bg-slate-100 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden group border border-slate-200">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical className={isPhOptimal ? "text-teal-700" : "text-amber-700"} size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">pH Tanah</h3>
              </div>
              <p className={`text-sm font-medium ${isPhOptimal ? "text-teal-700" : "text-amber-700"}`}>
                {isPhOptimal ? "Tingkat Optimal" : "Di Luar Target (5.5 - 6.5)"}
              </p>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline mb-2">
              <span className={`text-6xl md:text-7xl font-extrabold tracking-tighter ${isPhOptimal ? "text-slate-900" : "text-amber-600"}`}>
                {sensor.ph_value.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Notifikasi & Rekomendasi</h3>
        <div className="flex flex-col gap-4">
          
          {/* Mapping Data Notifikasi dari Supabase */}
          {alerts.length > 0 ? alerts.map(alert => (
             <div key={alert.id} className="bg-gradient-to-br from-red-700 to-red-600 rounded-3xl p-6 shadow-lg flex items-start gap-5 relative overflow-hidden">
               <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
               <div className="bg-white/20 p-3 rounded-full flex-shrink-0 backdrop-blur-md text-white">
                 <AlertCircle size={24} />
               </div>
               <div className="relative z-10">
                 <h4 className="font-bold text-lg text-white mb-1">{alert.notifications?.type || 'Peringatan'}</h4>
                 <p className="text-white/90 text-sm leading-relaxed mb-4">{alert.notifications?.message}</p>
                 <button onClick={() => handleMarkAsRead(alert.id)} className="bg-white text-red-700 font-bold text-xs px-5 py-2.5 rounded-full hover:bg-slate-100 transition-colors uppercase tracking-wide">
                   Tandai Selesai
                 </button>
               </div>
             </div>
          )) : isPhOptimal && isMoistureOptimal && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="bg-teal-50 p-2.5 rounded-full flex-shrink-0 text-teal-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Lingkungan Optimal</h4>
                <p className="text-slate-500 text-xs mt-0.5">Sistem irigasi dan pH berjalan sesuai target. Tidak ada tindakan yang diperlukan.</p>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}