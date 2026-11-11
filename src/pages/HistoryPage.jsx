import React, { useEffect, useState, useRef } from 'react';
import { Search, Icon, CheckSquare, Square, Trash2, CheckCircle2, X, Loader2 } from 'lucide-react';
import { strawberry } from '@lucide/lab';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom'; 
import { DISEASE_IMAGES } from './DiagnosticResult'; 

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate(); 
  
  const pressTimer = useRef(null);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('disease_histories')
        .select(`id, user_id, disease_catalog_id, confidence, is_handled, scanned_at, disease_catalogs(*)`) 
        .eq('user_id', user.id) 
        .order('scanned_at', { ascending: false }); 
        
      if (data && !error) {
        setHistory(data);
      } else if (error) {
        console.error("Gagal memuat data dari Supabase:", error.message);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    const diseaseName = item.disease_catalogs?.name || "";
    return diseaseName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  
  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredHistory.length) {
      setSelectedIds([]); 
    } else {
      setSelectedIds(filteredHistory.map(item => item.id)); 
    }
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleTouchStart = (id) => {
    if (isSelectionMode) return;
    
    pressTimer.current = setTimeout(() => {
      setIsSelectionMode(true);
      toggleSelection(id);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500); 
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleTouchMove = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleItemClick = (id) => {
    if (isSelectionMode) {
      toggleSelection(id);
    } else {
      navigate(`/history/${id}`);
    }
  };

  
  const handleMarkAsHandledMulti = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    
    try {
      const updatePromises = selectedIds.map(id =>
        supabase.from('disease_histories').update({ is_handled: true }).eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      const hasError = results.some(res => res.error);
      if (hasError) throw new Error("Akses RLS ditolak.");

      await fetchHistory(); 
      cancelSelection();
      
    } catch (err) {
      console.error("Gagal update massal:", err.message);
      alert(" Gagal memperbarui status!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMulti = async () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(`Yakin ingin menghapus ${selectedIds.length} riwayat yang dipilih secara permanen?`);
    if (!confirmDelete) return;

    setIsProcessing(true);
    
    try {
      const deletePromises = selectedIds.map(id =>
        supabase.from('disease_histories').delete().eq('id', id)
      );

      const results = await Promise.all(deletePromises);
      const hasError = results.some(res => res.error);
      if (hasError) throw new Error("Akses RLS ditolak.");

      await fetchHistory(); 
      cancelSelection();
      
    } catch (err) {
      console.error("Gagal hapus massal:", err.message);
      alert(" Gagal menghapus!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="pt-24 md:pt-28 pb-48 px-4 md:px-8 max-w-5xl mx-auto w-full relative min-h-screen">
      
      <div className="mb-10 mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-4xl text-slate-900 mb-2 tracking-tight">Riwayat Diagnosa</h1>
          <p className="text-slate-500 text-sm max-w-md">Pantau riwayat deteksi penyakit dan status penanganannya.</p>
        </div>
        
        {filteredHistory.length > 0 && !isSelectionMode && (
          <button 
            type="button"
            onClick={() => setIsSelectionMode(true)}
            className="self-start md:self-auto bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors active:scale-95"
          >
            <CheckSquare size={16} /> Pilih Riwayat
          </button>
        )}
      </div>
      
      <div className="relative max-w-xl mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Diagnosa..." 
          className="w-full bg-white border border-slate-200 rounded-md pl-12 pr-4 py-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" 
          disabled={isSelectionMode} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {filteredHistory.length > 0 ? filteredHistory.map(item => {
          const catalog = item.disease_catalogs;
          const timestamp = item.scanned_at;
          const isHandled = item.is_handled; 
          const isSelected = selectedIds.includes(item.id);
          
          const imageSrc = DISEASE_IMAGES && catalog ? (DISEASE_IMAGES[catalog.id] || DISEASE_IMAGES.default) : 'https://cs-assets.bayer.com/is/image/bayer/TP-2024012705';

          return (
            <article 
              key={item.id} 
              onClick={() => handleItemClick(item.id)}
              onTouchStart={() => handleTouchStart(item.id)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              onMouseDown={() => handleTouchStart(item.id)} 
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              className={`bg-white rounded-xl p-4 md:p-5 flex gap-5 shadow-sm border relative overflow-hidden transition-all cursor-pointer select-none
                ${isSelectionMode ? (isSelected ? 'border-red-500 bg-red-50/50 scale-[0.98]' : 'border-slate-200 hover:border-slate-300') : 'border-slate-100 group hover:-translate-y-1 active:scale-[0.98]'}
              `}
            >
              {isSelectionMode && (
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                  {isSelected ? (
                    <CheckSquare size={24} className="text-red-600 bg-white rounded-md" />
                  ) : (
                    <Square size={24} className="text-slate-300 bg-white/50 rounded-md" />
                  )}
                </div>
              )}

              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shrink-0 relative bg-slate-200">
                <img 
                  alt={catalog?.name || "Penyakit"} 
                  className={`w-full h-full object-cover transition-all ${isHandled ? 'grayscale opacity-70' : ''}`} 
                  src={imageSrc}
                  onError={(e) => { e.target.src = 'https://cs-assets.bayer.com/is/image/bayer/TP-2024012705'; }}
                />
              </div>
              
              <div className="flex flex-col justify-center flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                    {timestamp ? new Date(timestamp).toLocaleDateString('id-ID') : '-'}
                  </span>
                  
                  {!isSelectionMode && (
                     <span className={`shrink-0 ml-2 px-2.5 py-1 rounded-full text-[9px] uppercase font-extrabold tracking-wide ${isHandled ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                       {isHandled ? 'Sudah Ditangani' : 'Belum Ditangani'}
                     </span>
                  )}
                </div>
                <h2 className="font-bold text-lg md:text-xl text-slate-900 mb-1 leading-tight line-clamp-2">
                  {catalog?.name || 'Tidak Diketahui'}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Icon iconNode={strawberry} className="w-3.5 h-3.5" /> Akurasi: {(item.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </article>
          );
        }) : (
          <p className="text-slate-400 font-medium">Belum ada riwayat deteksi penyakit yang tersimpan.</p>
        )}
      </div>

      {isSelectionMode && (
        <div className="fixed bottom-[80px] left-0 w-full z-50 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 md:p-6 flex flex-col md:flex-row gap-4 justify-between md:items-center animate-in slide-in-from-bottom-4">
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <button type="button" onClick={cancelSelection} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 active:scale-95 transition-transform shrink-0">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <span className="font-bold text-slate-800 text-sm md:text-base">{selectedIds.length} Dipilih</span>
              <button 
                type="button"
                onClick={handleSelectAll}
                className="text-red-600 text-xs font-bold uppercase tracking-wider hover:underline ml-auto md:ml-2"
              >
                {selectedIds.length === filteredHistory.length ? 'Batalkan Semua' : 'Pilih Semua'}
              </button>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button 
              type="button"
              onClick={handleDeleteMulti}
              disabled={selectedIds.length === 0 || isProcessing}
              className="flex-1 md:flex-none px-3 md:px-6 py-3 bg-red-50 text-red-700 font-bold text-xs md:text-sm rounded-md flex items-center justify-center gap-2 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              <span>Hapus</span>
            </button>
            
            <button 
              type="button"
              onClick={handleMarkAsHandledMulti}
              disabled={selectedIds.length === 0 || isProcessing}
              className="flex-[1.5] md:flex-none px-4 md:px-6 py-3 bg-teal-600 text-white font-bold text-xs md:text-sm rounded-md flex items-center justify-center gap-2 shadow-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Tandai Selesai</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}