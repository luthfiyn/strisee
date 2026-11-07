import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Circle, Save, Scan, Loader2, Icon } from 'lucide-react';
import { strawberry } from '@lucide/lab';
import { supabase } from '../supabaseClient';

// 1. IMPORT GAMBAR DARI FOLDER ASSETS LOKAL
import imgAngularLeafspot from '../assets/angular_leafspot.jpg';
import imgAnthracnose from '../assets/anthracnose_fruit_rot.jpg';
import imgBlossomBlight from '../assets/blossom_blight.jpg';
import imgGrayMold from '../assets/gray_mold.jpg';
import imgLeafSpot from '../assets/leaf_spot.jpg';
import imgPowderyFruit from '../assets/powdery_mildew_fruit.jpg';
import imgPowderyLeaf from '../assets/powdery_mildew_leaf.jpg';

// 2. PEMETAAN GAMBAR PENYAKIT
export const DISEASE_IMAGES = {
  1: imgAngularLeafspot,
  2: imgAnthracnose,
  3: imgGrayMold,
  4: imgBlossomBlight,
  5: imgLeafSpot,
  6: imgPowderyFruit,
  7: imgPowderyLeaf,
  default: 'https://cs-assets.bayer.com/is/image/bayer/TP-2024012705'
};

// 3. VARIABEL MEMORI GLOBAL UNTUK MODEL AI 
// (Mencegah pemuatan ulang file .tflite saat keluar-masuk halaman kamera)
let globalAiModel = null;
let isInitializing = false;

export default function DiagnosticResult() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [model, setModel] = useState(globalAiModel);
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        setErrorMsg("Gagal mengakses kamera.");
      }
    };
    startCamera();

    const initAI = async () => {
      // Batal jika model sudah tersimpan atau sedang diproses
      if (globalAiModel || isInitializing) return;
      isInitializing = true;

      try {
        if (!window.tflite) throw new Error("Mesin TFLite belum selesai diunduh, coba sesaat lagi.");
        
        // Path WASM diset manual karena library dipanggil dari CDN (index.html)
        window.tflite.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite/dist/');
        
        const loadedModel = await window.tflite.loadTFLiteModel('/yolov12-strise.tflite');
        
        globalAiModel = loadedModel;
        setModel(loadedModel);
      } catch (e) {
        console.error("Gagal menyiapkan model AI:", e);
      } finally {
        isInitializing = false;
      }
    };

    // Jalankan inisialisasi hanya jika model belum termuat
    if (!model) initAI();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [model]);

  const handleScan = async () => {
    if (!model || !videoRef.current) return;
    setIsScanning(true); 
    setErrorMsg("");
    
    // Memberikan waktu bagi React untuk mengubah UI tombol menjadi "Menganalisis..."
    await new Promise(r => setTimeout(r, 50));

    try {
      // Mengambil objek tf dari memori global window (dari index.html)
      const tf = window.tf; 
      if (!tf) throw new Error("Library TensorFlow.js belum termuat sempurna.");

      const tensor = tf.browser.fromPixels(videoRef.current).resizeBilinear([640, 640]).expandDims(0).div(255.0); 
      const prediction = await model.predict(tensor); 
      const outputData = prediction.dataSync();
      const shape = prediction.shape; 
      
      tf.dispose(tensor); 
      if (prediction) tf.dispose(prediction);
      
      let bestIndex = 0, bestConfidence = 0;
      if (shape.length === 3) {
        const numAnchors = shape[1] === 11 ? shape[2] : shape[1];
        for (let c = 0; c < 7; c++) {
          for (let a = 0; a < numAnchors; a++) {
            const prob = shape[1] === 11 ? outputData[(4 + c) * numAnchors + a] : outputData[a * 11 + 4 + c];
            if (prob > bestConfidence) { bestConfidence = prob; bestIndex = c; }
          }
        }
      }

      if (bestConfidence < 0.3) throw new Error("Akurasi terlalu rendah. Coba sudut atau pencahayaan lain.");

      const detectedClassId = bestIndex + 1; 
      const { data: catalogData, error: dbError } = await supabase
        .from('disease_catalogs')
        .select('*')
        .eq('id', detectedClassId)
        .single();
        
      if (dbError || !catalogData) throw new Error("Data penyakit tidak ditemukan di database.");
      
      const finalResult = { confidence: bestConfidence, disease_catalog_id: detectedClassId, ...catalogData };
      setResult(finalResult);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Simpan ke Riwayat (Otomatis is_handled = false di database)
        await supabase.from('disease_histories').insert([{ 
          user_id: user.id, 
          disease_catalog_id: detectedClassId, 
          confidence: bestConfidence 
        }]);

        // 2. Kirim Notifikasi Internal
        await supabase.from('notifications').insert([{
          user_id: user.id,
          category: 'system',
          type: 'Diagnosa AI',
          title: `Terdeteksi: ${catalogData.name}`,
          description: `Akurasi deteksi ${(bestConfidence * 100).toFixed(0)}%. Silakan cek rencana penanganan agar tidak menyebar.`,
          location: 'Pemindaian Kamera Langsung'
        }]);
      }
    } catch (err) {
      setErrorMsg(err.message); 
    } finally {
      setIsScanning(false);
    }
  };

  // -------------------------------------------------------------
  // TAMPILAN 1: MODE KAMERA (BINGKAI PEMINDAI)
  // -------------------------------------------------------------
  if (!result) {
    return (
      <div className="h-screen bg-black flex flex-col relative overflow-hidden">
        
        {/* Header Kamera */}
        <header className="absolute top-0 w-full z-50 flex justify-between items-center p-6 pointer-events-auto">
          <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg text-slate-900 active:scale-95 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-900">Live Kamera</span>
          </div>
        </header>

        {/* Pesan Error (Jika Ada) */}
        {errorMsg && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-red-100/90 backdrop-blur-md text-red-800 p-4 rounded-xl text-center text-sm font-bold z-50 shadow-xl">
            {errorMsg}
          </div>
        )}

        {/* Video Kamera */}
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-[75vh] object-cover" />
        
        {/* Bingkai Pemindai (Scanner Frame) dengan efek bayangan luar */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[75%] max-w-xs h-[40vh] border border-white/20 rounded-2xl pointer-events-none z-30 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-xl"></div>
        </div>

        {/* Petunjuk Melayang */}
        <div className="absolute top-[65%] w-full flex justify-center z-30 px-6">
           <span className="bg-black/60 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg border border-white/10 text-center animate-bounce">
             Arahkan kamera ke daun atau buah
           </span>
        </div>

        {/* Panel Bawah (Tombol Aksi) */}
        <div className="bg-white flex-1 -mt-6 rounded-t-[2.5rem] p-6 flex flex-col items-center justify-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          {!model ? (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 size={32} className="animate-spin text-red-600" />
              <span className="text-sm font-bold animate-pulse">Menyiapkan AI Strise...</span>
            </div>
          ) : (
            <button 
              onClick={handleScan} 
              disabled={isScanning} 
              className={`flex items-center gap-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-full p-5 md:p-6 shadow-[0_8px_24px_rgba(183,16,42,0.3)] active:scale-95 transition-all disabled:opacity-50 ${isScanning ? 'px-10' : 'hover:scale-[1.02]'}`}
            >
              {isScanning ? (
                <>
                  <Loader2 size={28} className="animate-spin" />
                  <span className="font-bold text-lg">Menganalisis...</span>
                </>
              ) : (
                <>
                  <Scan size={32} />
                  <span className="font-bold text-lg px-2">Deteksi Penyakit</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TAMPILAN 2: HASIL DETEKSI AI
  // -------------------------------------------------------------
  const displayImage = DISEASE_IMAGES[result.disease_catalog_id] || DISEASE_IMAGES.default;

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
      <header className="absolute top-0 w-full z-50 flex justify-between items-center p-6">
        <button onClick={() => setResult(null)} className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-full shadow-lg text-slate-900 active:scale-95"><ArrowLeft size={24} /></button>
      </header>
      
      <section className="relative w-full h-[442px] md:h-[530px] bg-slate-200 rounded-br-[4rem] overflow-hidden">
        <img alt="Penyakit Tanaman" className="w-full h-full object-cover object-center" src={displayImage} onError={(e) => { e.target.src = DISEASE_IMAGES.default; }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
      </section>
      
      <main className="relative z-10 -mt-20 px-6 max-w-4xl mx-auto">
        
        {/* Banner Utama */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-12 border border-slate-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 pr-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mb-2">{result.name}</h1>
            </div>
            <div className="flex flex-col items-center justify-center bg-red-50 text-red-800 p-4 rounded-2xl shrink-0 h-24 min-w-[90px]">
              <span className="text-[10px] uppercase tracking-widest font-bold mb-2 opacity-80 text-center leading-tight">Akurasi<br/>AI</span>
              <span className="text-2xl font-bold leading-none">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Informasi Gejala */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Gejala Teridentifikasi</h2>
          <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-1">
              <Circle size={20} />
            </div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{result.symptoms}</p>
          </div>
        </section>

        {/* Solusi/Penanganan */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Rencana Penanganan</h2>
          <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 text-teal-700 mt-1">
              <Icon iconNode={strawberry} className="w-5 h-5" />
            </div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{result.treatment}</p>
          </div>
        </section>
      </main>

      {/* Tombol Simpan/Lanjutkan */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/90 backdrop-blur-md pt-4 pb-6 px-6 flex justify-center border-t border-slate-100">
        <button onClick={() => navigate('/history')} className="w-full max-w-4xl relative rounded-2xl bg-gradient-to-r from-red-700 to-red-600 text-white py-5 px-8 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 hover:scale-[1.01]">
          <Save size={24} />
          <span className="font-bold text-lg">Lihat di Riwayat</span>
        </button>
      </div>
    </div>
  );
}