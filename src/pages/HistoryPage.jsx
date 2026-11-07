import React, { useEffect, useState } from 'react';
import { Search, Icon } from 'lucide-react';
import { strawberry } from '@lucide/lab';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom'; 
import { DISEASE_IMAGES } from './DiagnosticResult'; 

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('disease_histories')
          .select(`*, disease_catalogs(*)`) 
          .eq('user_id', user.id) 
          .order('scanned_at', { ascending: false }); 
          
        if (data && !error) {
          setHistory(data);
        } else if (error) {
          console.error("Gagal memuat data dari Supabase:", error.message);
        }
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    const diseaseName = item.disease_catalogs?.name || "";
    return diseaseName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <main className="pt-24 md:pt-28 pb-32 px-4 md:px-8 max-w-5xl mx-auto w-full">
      <div className="mb-10 mt-4">
        <h1 className="font-extrabold text-4xl text-slate-900 mb-2 tracking-tight">Riwayat Diagnosa</h1>
        <p className="text-slate-500 mb-8 text-sm max-w-md">Tinjau riwayat pemindaian lingkungan dan status penanganannya.</p>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Diagnosa..." 
            className="w-full bg-white border border-slate-200 rounded-md pl-12 pr-4 py-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {filteredHistory.length > 0 ? filteredHistory.map(item => {
          const catalog = item.disease_catalogs;
          const timestamp = item.scanned_at;
          const isHandled = item.is_handled; // Menarik status dari Supabase
          
          const imageSrc = DISEASE_IMAGES && catalog ? (DISEASE_IMAGES[catalog.id] || DISEASE_IMAGES.default) : 'https://cs-assets.bayer.com/is/image/bayer/TP-2024012705';

          return (
            <article 
              key={item.id} 
              onClick={() => navigate(`/history/${item.id}`)}
              className="bg-white rounded-xl p-4 md:p-5 flex gap-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer active:scale-[0.98]"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shrink-0 relative bg-slate-200">
                <img 
                  alt={catalog?.name || "Penyakit"} 
                  className={`w-full h-full object-cover transition-all ${isHandled ? 'grayscale opacity-70' : ''}`} 
                  src={imageSrc}
                  onError={(e) => { e.target.src = 'https://cs-assets.bayer.com/is/image/bayer/TP-2024012705'; }}
                />
              </div>
              <div className="flex flex-col justify-center flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {timestamp ? new Date(timestamp).toLocaleDateString('id-ID') : '-'}
                  </span>
                  
                  {/* LENCANA STATUS DINAMIS */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${isHandled ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isHandled ? 'Sudah Ditangani' : 'Belum Ditangani'}
                  </span>
                  
                </div>
                <h2 className="font-bold text-xl text-slate-900 mb-1 leading-tight line-clamp-2">
                  {catalog?.name || 'Tidak Diketahui'}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Icon iconNode={strawberry} className="w-3.5 h-3.5" /> Akurasi: {(item.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </article>
          );
        }) : (
          <p className="text-slate-400 font-medium">Tidak ada riwayat diagnosa yang ditemukan.</p>
        )}
      </div>
    </main>
  );
}