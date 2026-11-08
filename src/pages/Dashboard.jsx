import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, FlaskConical, Droplet, Scan, Icon } from 'lucide-react';
import { strawberry } from '@lucide/lab';
import { supabase } from '../supabaseClient';
import { useSensor } from '../context/SensorContext';
import gambarKebun from '../assets/img_dashboard.jpg';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Petani");
  const { sensor } = useSensor();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.full_name?.split(' ')[0] || "Petani");
    });
  }, []);

  const isOptimal = 
    sensor.ph_value >= 5.5 && 
    sensor.ph_value <= 6.5 && 
    sensor.moisture_value >= 60 && 
    sensor.moisture_value <= 80;

  return (
    <main className="pt-24 px-6 max-w-7xl mx-auto flex flex-col gap-8 md:px-12 w-full pb-32">
      <section className="flex flex-col gap-2 mt-4">
        <h2 className="font-extrabold text-4xl text-slate-900 tracking-tight">Halo, {userName}!</h2>
        <p className="text-slate-500 text-lg">Pantau kesehatan kebun stroberi Anda hari ini.</p>
      </section>
      
      <section className="relative w-full h-64 md:h-80 rounded-[2rem] overflow-hidden shadow-xl group">
        <img alt="Strawberry Garden" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={gambarKebun}/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:w-80 bg-white/90 backdrop-blur-xl rounded-[1.5rem] p-5 flex items-center justify-between shadow-lg transition-all duration-500">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Status Kebun</p>
            <h3 className={`font-bold text-xl flex items-center gap-2 transition-colors ${isOptimal ? 'text-teal-700' : 'text-amber-700'}`}>
              <Icon iconNode={strawberry} className="w-5 h-5" /> {isOptimal ? "Kondisi Optimal" : "Butuh Tindakan"}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isOptimal ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
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
            <div className={`px-3 py-1 rounded-full border transition-colors ${sensor.ph_value >= 5.5 && sensor.ph_value <= 6.5 ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
              <span className="text-xs font-bold">{sensor.ph_value >= 5.5 && sensor.ph_value <= 6.5 ? 'Normal' : 'Kritis'}</span>
            </div>
          </div>
          
          <div className="relative z-10 mt-6 w-full flex flex-col">
            <div className="flex items-baseline gap-2 transition-all duration-500 mb-3">
              <span className="font-extrabold text-5xl text-slate-900 tracking-tighter">{sensor.ph_value.toFixed(1)}</span>
              <span className="text-slate-400">pH</span>
            </div>
          
            <div className="w-full">
              <div className="h-1.5 w-full bg-slate-100 rounded-full relative">
                <div 
                  className="absolute top-0 left-0 h-1.5 bg-amber-600 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(0, Math.min(100, ((sensor.ph_value - 4) / 4) * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <span>4.0</span>
                <span>5.5 (Target)</span>
                <span>8.0</span>
              </div>
            </div>
          </div>
        </div>
        
        <div onClick={() => navigate('/monitoring')} className="cursor-pointer md:col-span-5 bg-slate-100 rounded-[2rem] p-6 flex flex-col justify-between min-h-[160px] hover:bg-slate-200 transition-colors">
          <div className="flex items-start justify-between">
            <div><h4 className="font-bold text-lg text-slate-900">Kelembaban Tanah</h4></div>
            <div className="w-10 h-10 rounded-full bg-teal-200 flex items-center justify-center text-teal-800 shrink-0">
              <Droplet size={20} />
            </div>
          </div>
          
          <div className="mt-6 flex items-end justify-between w-full">
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase font-bold mb-1 transition-colors ${sensor.moisture_value >= 60 && sensor.moisture_value <= 80 ? 'text-teal-700' : 'text-red-700'}`}>
                {sensor.moisture_value >= 60 && sensor.moisture_value <= 80 ? 'Normal' : 'Kritis'}
              </span>
              <div className="flex items-baseline gap-1 transition-all duration-500">
                <span className="font-extrabold text-4xl text-slate-900 tracking-tighter">{sensor.moisture_value.toFixed(0)}</span>
                <span className="font-bold text-xl text-slate-400">%</span>
              </div>
            </div>

            <div className="flex items-end gap-1 h-10 pb-0.5 opacity-80">
              <div className="w-3.5 h-3 bg-slate-300 rounded-[2px]"></div>
              <div className="w-3.5 h-5 bg-slate-300 rounded-[2px]"></div>
              <div className="w-3.5 h-7 bg-slate-300 rounded-[2px]"></div>
              <div className="w-4 h-10 bg-teal-600 rounded-[2px] shadow-sm"></div>
              <div className="w-3.5 h-8 bg-slate-300 rounded-[2px]"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 flex justify-center pb-8">
        <button onClick={() => navigate('/diagnostic')} className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-[1.5rem] px-10 py-5 shadow-[0_16px_32px_rgba(183,16,42,0.25)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto md:min-w-[320px] relative overflow-hidden">
          <Scan size={24} />
          <span className="font-bold tracking-wide text-lg">Mulai Pindai Tanaman</span>
        </button>
      </section>
    </main>
  );
}