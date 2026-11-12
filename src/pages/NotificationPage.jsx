import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, ThermometerSnowflake, Droplets, Scan, Radio, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useSensor } from '../context/SensorContext';

export default function NotificationPage() {
  const navigate = useNavigate();
  const { sensor } = useSensor();
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeNotification = (row) => {
    const rawType = row.type || 'Info Sistem';
    const isCritical = rawType.toLowerCase().includes('critical') || rawType.toLowerCase().includes('kritis') || row.category === 'important';
    const isEnv = rawType.toLowerCase().includes('ph') || rawType.toLowerCase().includes('moisture') || rawType.toLowerCase().includes('kelembaban') || row.category === 'environment';

    return {
      id: row.id || row.notifications_id,
      category: row.category || (isCritical ? 'important' : isEnv ? 'environment' : 'system'),
      type: rawType,
      title: row.title || (rawType === 'CRITICAL PH' ? 'Peringatan pH Tanah Kritis' : rawType === 'LOW MOISTURE' ? 'Peringatan Kelembaban Tanah' : rawType),
      description: row.description || row.message || '',
      location: row.location || 'Kebun Via Strawberry',
      is_read: Boolean(row.is_read),
      created_at: row.created_at
    };
  };

  const generateSensorAlerts = () => {
    const alerts = [];
    if (!sensor) return alerts;

    if (sensor.ph_value < 5.5) {
      alerts.push({
        id: 'sensor-ph-low',
        category: 'important',
        type: 'Sensor Tanah • pH Asam',
        title: `Tanah Terlalu Asam (pH ${sensor.ph_value.toFixed(1)}) — Beri Kapur Dolomit`,
        description: 'Untuk skala polybag/pot, cukup taburkan 1 – 2 sendok makan (15–30 gram) per polybag lalu siram sedikit air. Diamkan selama 1 hingga 2 minggu agar pH bereaksi naik sebelum pemupukan berikutnya.',
        location: 'Sektor Pemantauan Aktif',
        is_read: false,
        created_at: new Date().toISOString()
      });
    } else if (sensor.ph_value > 7.0) {
      alerts.push({
        id: 'sensor-ph-high',
        category: 'important',
        type: 'Sensor Tanah • pH Basa',
        title: `Tanah Terlalu Basa (pH ${sensor.ph_value.toFixed(1)}) — Beri Bubuk Belerang`,
        description: 'Untuk skala polybag, cukup berikan 1 sendok teh (sekitar 5 gram) bubuk belerang (sulfur) per polybag.',
        location: 'Sektor Pemantauan Aktif',
        is_read: false,
        created_at: new Date().toISOString()
      });
    } else {
      alerts.push({
        id: 'sensor-ph-normal',
        category: 'environment',
        type: 'Sensor Tanah • pH Normal',
        title: `pH Tanah Ideal (${sensor.ph_value.toFixed(1)}) — Dosis Pupuk Rutin`,
        description: 'Berikan pupuk NPK seimbang (16-16-16) sebanyak 5 – 10 gram per tanaman setiap 2 minggu sekali dengan cara dikocor atau ditugal di pinggir tajuk daun, serta tambahkan 500 gram kompos matang sebagai penstabil pH alami.',
        location: 'Sektor Pemantauan Aktif',
        is_read: true,
        created_at: new Date().toISOString()
      });
    }

    if (sensor.moisture_value > 80) {
      alerts.push({
        id: 'sensor-moisture-high',
        category: 'important',
        type: 'Sensor Tanah • Kelembaban Tinggi',
        title: `Kelembaban Tanah Tinggi (${sensor.moisture_value.toFixed(0)}%) — Risiko Busuk Akar`,
        description: 'Hentikan penyiraman total hingga turun ke 70–85%. Perdalam parit bedengan menjadi 30–40 cm atau tambah lubang drainase polybag dan beri ganjalan. Gemburkan permukaan tanah dan campurkan sekam bakar/pasir kasar (rasio tanah:kompos:sekam = 1:1:2).',
        location: 'Sektor Pemantauan Aktif',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    return alerts;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let dbNotifications = [];

        if (user) {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            dbNotifications = data.map(normalizeNotification);
          } else {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('notifications')
              .select('*')
              .order('created_at', { ascending: false });

            if (!fallbackError && fallbackData) {
              dbNotifications = fallbackData.map(normalizeNotification);
            }
          }
        }

        const liveSensorAlerts = generateSensorAlerts();
        setNotifications([...liveSensorAlerts, ...dbNotifications]);
      } catch (err) {
        console.error("Gagal memuat notifikasi:", err.message);
        setNotifications(generateSensorAlerts());
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        setNotifications(current => [normalizeNotification(payload.new), ...current]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sensor?.ph_value, sensor?.moisture_value]);

  const hasUnread = notifications.some(n => !n.is_read);

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('is_read', false);
      }
    } catch (err) {
      console.error("Gagal menandai semua dibaca:", err.message);
    }
  };

  const handleDismiss = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    if (String(id).startsWith('sensor-')) return;

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    } catch (err) {
      console.error("Gagal menandai dibaca:", err.message);
    }
  };

  const getIconForCategory = (category, type) => {
    if (category === 'important') return <AlertTriangle size={24} className="md:w-7 md:h-7" />;
    if (category === 'environment' && type?.toLowerCase().includes('suhu')) return <ThermometerSnowflake size={24} className="md:w-7 md:h-7" />;
    if (category === 'environment') return <Droplets size={24} className="md:w-7 md:h-7" />;
    if (type?.toLowerCase().includes('diagnosa')) return <Scan size={24} className="md:w-7 md:h-7" />;
    return <Radio size={24} className="md:w-7 md:h-7" />;
  };

  const getColorStyle = (category, isRead) => {
    if (isRead) return { border: 'bg-transparent', iconBg: 'bg-slate-100 text-slate-500', text: 'text-slate-500', dot: 'hidden' };
    
    if (category === 'important') return { border: 'bg-red-600', iconBg: 'bg-red-50 text-red-700', text: 'text-red-700', dot: 'bg-red-600' };
    if (category === 'environment') return { border: 'bg-amber-500', iconBg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', dot: 'bg-amber-500' };
    if (category === 'system') return { border: 'bg-teal-600', iconBg: 'bg-teal-50 text-teal-700', text: 'text-teal-700', dot: 'bg-teal-600' };
    
    return { border: 'bg-blue-600', iconBg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', dot: 'bg-blue-600' };
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'environment') return n.category === 'environment' || String(n.id).startsWith('sensor-');
    return n.category === activeFilter;
  });

  return (
    <div className="bg-slate-50 font-sans text-slate-900 flex flex-col min-h-screen antialiased">
      
      <style>{`
        @media (min-width: 768px) {
          body { padding-left: 0 !important; }
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 w-full z-[60] bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 cursor-pointer group">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-900 transition-colors shrink-0">
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Notifikasi</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleMarkAllRead}
              disabled={!hasUnread || loading}
              className={`h-10 px-4 md:px-5 rounded-full flex items-center gap-2 transition-colors text-sm font-bold ${!hasUnread ? 'bg-slate-100 text-slate-400' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'}`}
            >
              <CheckCircle2 size={18} />
              <span className="hidden sm:block">{!hasUnread ? 'Semua Dibaca' : 'Tandai Semua Selesai'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 md:pt-28 pb-32 px-4 md:px-8 max-w-3xl mx-auto w-full min-h-screen">
        <div className="flex flex-col gap-6">
          
          <section className="px-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kotak Masuk</span>
              {hasUnread && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">Baru</span>}
            </div>
          </section>

          <section className="w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max px-2 md:px-0">
              <button onClick={() => setActiveFilter('all')} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${activeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>Semua</button>
              <button onClick={() => setActiveFilter('important')} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${activeFilter === 'important' ? 'bg-red-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                Penting
              </button>
              <button onClick={() => setActiveFilter('environment')} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${activeFilter === 'environment' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                Sensor Tanah
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 size={32} className="text-slate-300 animate-spin" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                <CheckCircle2 size={48} className="text-slate-300 mb-4" />
                <p className="text-lg font-bold text-slate-500">Tidak ada pemberitahuan.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const style = getColorStyle(notif.category, notif.is_read);

                return (
                  <article key={notif.id} className={`relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 ${notif.is_read ? 'bg-white border border-slate-100 opacity-70' : 'bg-white shadow-sm border border-slate-200'}`}>
                    
                    {!notif.is_read && <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.border}`}></div>}
                    
                    <div className="flex items-start gap-4 w-full pl-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
                        {getIconForCategory(notif.category, notif.type)}
                      </div>
                      
                      <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>{notif.type}</span>
                          <span className="text-xs font-bold text-slate-400">{formatTime(notif.created_at)}</span>
                        </div>
                        
                        <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight pr-4">{notif.title}</h3>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{notif.description}</p>
                        
                        {notif.location && <p className="text-xs font-bold text-slate-400 mt-2">{notif.location}</p>}
                        
                        {!notif.is_read && notif.category === 'important' && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <button 
                              onClick={() => handleDismiss(notif.id)}
                              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold transition-colors"
                            >
                              Tandai Selesai
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}