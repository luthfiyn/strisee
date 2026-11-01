import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, TrendingUp, FlaskConical, Droplet, Scan } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Petani");
  const [sensor, setSensor] = useState({ ph_value: 6.5, moisture_value: 70 });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.full_name?.split(' ')[0] || "Petani");
    });

    const fetchLatest = async () => {
      const { data } = await supabase.from('sensor_logs').select('*').order('timestamp', { ascending: false }).limit(1);
      if (data?.length > 0) setSensor(data[0]);
    };
    fetchLatest();

    const channel = supabase.channel('dashboard_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_logs' }, (payload) => setSensor(payload.new))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const isOptimal = sensor.ph_value >= 5.5 && sensor.ph_value <= 6.5 && sensor.moisture_value >= 60 && sensor.moisture_value <= 80;

  return (
    <main className="pt-24 px-6 max-w-7xl mx-auto flex flex-col gap-8 md:px-12 w-full pb-32">
      <section className="flex flex-col gap-2 mt-4">
        <h2 className="font-extrabold text-4xl text-slate-900 tracking-tight">Halo, {userName}!</h2>
        <p className="text-slate-500 text-lg">Kebun Anda tumbuh subur hari ini.</p>
      </section>
      
      <section className="relative w-full h-64 md:h-80 rounded-[2rem] overflow-hidden shadow-xl group">
        <img alt="Strawberry Garden" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAre_BK4_VCMV9NYsNB6Krz4Ce0H-45msrTW9TXM9dK8QKgw4GuZ036yO0Pkk1WxhO1doLtn9rHDiL2L4GLoBsaU2Wc0EMZE4xZIhxgWIpaxBJqpQJHDrKvEIzt5gk4Cef99lChmt3l6rdbmsBAxV1bpfaisl2Dey3GheKKpC7mSprpmwzsyXYiUEN4YCBD5UGBGiwxxIJbpGD5ImohuiYkgofhKTZEPQ6Pe9P4QnD2-xi7ThexMleSMHpKFCg1Fab9ZIx7tcZXXhs"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:w-80 bg-white/90 backdrop-blur-xl rounded-[1.5rem] p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Status Kebun</p>
            <h3 className={`font-bold text-xl flex items-center gap-2 ${isOptimal ? 'text-teal-700' : 'text-amber-700'}`}>
              <Sprout size={20} /> {isOptimal ? "Kondisi Optimal" : "Perlu Perhatian"}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOptimal ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
            <TrendingUp size={24} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
        <div onClick={() => navigate('/monitoring')} className="cursor-pointer md:col-span-7 bg-white rounded-[2rem] p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px] border border-slate-100 hover:border-teal-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5"><FlaskConical size={100} className="text-teal-700" /></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Data Real-time</p>
              <h4 className="font-bold text-lg text-slate-900 mt-1">pH Tanah</h4>
            </div>
            <div className={`${sensor.ph_value >= 5.5 && sensor.ph_value <= 6.5 ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-amber-50 border-amber-100 text-amber-700'} px-3 py-1 rounded-full border`}>
              <span className="text-xs font-bold">{sensor.ph_value >= 5.5 && sensor.ph_value <= 6.5 ? 'Normal' : 'Kritis'}</span>
            </div>
          </div>
          <div className="relative z-10 mt-6 flex items-baseline gap-2">
            <span className="font-extrabold text-5xl text-slate-900 tracking-tighter">{sensor.ph_value.toFixed(1)}</span>
            <span className="text-slate-400">pH</span>
          </div>
        </div>
        <div onClick={() => navigate('/monitoring')} className="cursor-pointer md:col-span-5 bg-slate-100 rounded-[2rem] p-6 flex flex-col justify-between min-h-[160px] hover:bg-slate-200 transition-colors">
          <div className="flex items-start justify-between">
            <div><h4 className="font-bold text-lg text-slate-900">Kelembaban Tanah</h4></div>
            <div className="w-10 h-10 rounded-full bg-teal-200 flex items-center justify-center text-teal-800">
              <Droplet size={20} />
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-4xl text-slate-900 tracking-tighter">{sensor.moisture_value.toFixed(0)}</span>
              <span className="font-bold text-xl text-slate-400">%</span>
            </div>
            <span className={`text-sm font-bold ${sensor.moisture_value >= 60 && sensor.moisture_value <= 80 ? 'text-teal-700' : 'text-red-700'}`}>
              {sensor.moisture_value >= 60 && sensor.moisture_value <= 80 ? 'Normal' : 'Kritis'}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-8 flex justify-center pb-8">
        <button onClick={() => navigate('/diagnostic')} className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-[1.5rem] px-10 py-5 shadow-[0_16px_32px_rgba(183,16,42,0.25)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto md:min-w-[320px] relative overflow-hidden">
          <Scan size={24} />
          <span className="font-bold tracking-wide text-lg">Pindai Tanaman</span>
        </button>
      </section>
    </main>
  );
}