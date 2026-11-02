import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Droplet, Circle, Wind, Sprout, Save, Scan } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import { supabase } from '../supabaseClient';

export default function DiagnosticResult() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Coba akses kamera belakang secara spesifik
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        // Fallback jika HP menolak facingMode (biasanya terjadi di beberapa browser Android/iOS)
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) videoRef.current.srcObject = fallbackStream;
        } catch (fallbackErr) {
          alert("Gagal mengakses kamera. Pastikan izin telah diberikan di pengaturan browser.");
        }
      }
    };
    
    startCamera();
    tflite.loadTFLiteModel('/yolov12-strise.tflite').then(setModel);
    
    // Matikan kamera saat keluar halaman
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleScan = async () => {
    if (!model || !videoRef.current) return;
    setIsScanning(true);

    try {
      const tensor = tf.browser.fromPixels(videoRef.current).resizeBilinear([640, 640]).expandDims(0).div(255.0);
      await model.predict(tensor); 
      
      const detectedClassId = 1; // Simulasi NMS 
      const detectedConfidence = 0.94;

      const { data: catalogData } = await supabase.from('disease_catalogs').select('*').eq('id', detectedClassId).single();
      const mockResult = { confidence: detectedConfidence, disease_catalog_id: detectedClassId, ...catalogData };
      setResult(mockResult);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('disease_histories').insert([{
          user_id: user.id,
          disease_catalog_id: mockResult.disease_catalog_id, 
          confidence: mockResult.confidence
        }]);
      }
    } catch (err) {
      console.error(err);
    }
    setIsScanning(false);
  };

  if (!result) {
    return (
      <div className="h-screen bg-black flex flex-col relative overflow-hidden">
        <header className="absolute top-0 w-full z-50 flex justify-between items-center p-6 pointer-events-auto">
          {/* Menggunakan navigate(-1) agar kembali ke halaman sebelumnya dengan aman */}
          <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-full shadow-lg text-slate-900 active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-900">Live</span>
          </div>
        </header>
        
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-[70vh] object-cover" />
        <div className="absolute top-[20%] left-[10%] w-[80%] h-[40vh] border-2 border-red-500 rounded-lg pointer-events-none"></div>
        
        <div className="bg-white flex-1 -mt-6 rounded-t-3xl p-6 flex flex-col items-center justify-center z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <p className="text-gray-500 text-center mb-6 text-sm font-medium">Arahkan kamera ke bagian daun atau buah yang sakit.</p>
          <button onClick={handleScan} disabled={isScanning || !model} className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-full p-6 shadow-xl active:scale-95 transition-all disabled:opacity-50">
            <Scan size={36} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <header className="absolute top-0 w-full z-50 flex justify-between items-center p-6">
        <button onClick={() => setResult(null)} className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-full shadow-lg text-slate-900 active:scale-95">
          <ArrowLeft size={24} />
        </button>
      </header>
      
      <section className="relative w-full h-[442px] md:h-[530px] bg-slate-200 rounded-br-[4rem] md:rounded-br-[6rem] overflow-hidden">
        <img alt="Strawberry leaf" className="w-full h-full object-cover object-center" src="https://cs-assets.bayer.com/is/image/bayer/TP-2024012705"/>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
      </section>
      
      <main className="relative z-10 -mt-20 md:-mt-32 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-12 border border-slate-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-none mb-2">{result.name || "Penyakit"}</h1>
            </div>
            <div className="flex flex-col items-end bg-red-50 text-red-800 px-4 py-3 rounded-2xl">
              <span className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-80">Akurasi</span>
              <span className="text-2xl font-bold leading-none">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Gejala Teridentifikasi</h2>
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-1"><Circle size={20} /></div>
            <p className="text-slate-600 leading-relaxed">{result.symptoms}</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Rencana Penanganan</h2>
          <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 text-teal-700 mt-1"><Sprout size={20} /></div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{result.treatment}</p>
          </div>
        </section>
      </main>
    </div>
  );
}