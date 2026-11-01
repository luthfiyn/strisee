import React, { useEffect, useState } from 'react';
import { Search, Sprout } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('disease_histories')
        .select(`*, disease_catalogs(name)`)
        .order('scanned_at', { ascending: false });
      if (data) setHistory(data);
    };
    fetchHistory();
  }, []);

  return (
    <main className="pt-24 md:pt-28 pb-32 px-4 md:px-8 max-w-5xl mx-auto w-full">
      <div className="mb-10 mt-4">
        <h1 className="font-extrabold text-4xl text-slate-900 mb-2 tracking-tight">Riwayat Diagnosa</h1>
        <p className="text-slate-500 mb-8 text-sm max-w-md">Tinjau riwayat pemindaian lingkungan dan anomali botani yang teridentifikasi.</p>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Cari Diagnosa..." className="w-full bg-white border border-slate-200 rounded-md pl-12 pr-4 py-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {history.length > 0 ? history.map(item => (
          <article key={item.id} className="bg-white rounded-xl p-4 md:p-5 flex gap-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shrink-0 relative bg-slate-200">
              <img alt="Plant Leaf" className="w-full h-full object-cover" src="https://cdn.mos.cms.futurecdn.net/smGrrgvBTRK8ysz2A9wHBV.jpg"/>
            </div>
            <div className="flex flex-col justify-center flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {new Date(item.scanned_at).toLocaleDateString('id-ID')}
                </span>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">Tersimpan</span>
              </div>
              <h2 className="font-bold text-xl text-slate-900 mb-1 leading-tight">{item.disease_catalogs?.name || 'Antraknosa'}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Sprout size={14} /> Akurasi: {(item.confidence * 100).toFixed(0)}%</p>
            </div>
          </article>
        )) : (
          <p className="text-slate-400">Belum ada riwayat tersimpan.</p>
        )}
      </div>
    </main>
  );
}