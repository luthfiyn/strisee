import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Circle, Save, Scan, Loader2, Icon, ImagePlus } from 'lucide-react';
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

let globalAiModel = null;
let isInitializing = false;

// FUNGSI HELPER NMS (Mencegah Kotak Bertumpuk)
function calculateIoU(box1, box2) {
  const x1 = Math.max(box1.xmin, box2.xmin);
  const y1 = Math.max(box1.ymin, box2.ymin);
  const x2 = Math.min(box1.xmax, box2.xmax);
  const y2 = Math.min(box1.ymax, box2.ymax);
  const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const box1Area = (box1.xmax - box1.xmin) * (box1.ymax - box1.ymin);
  const box2Area = (box2.xmax - box2.xmin) * (box2.ymax - box2.ymin);
  return intersectionArea / (box1Area + box2Area - intersectionArea);
}

export default function DiagnosticResult() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null); 
  
  const [model, setModel] = useState(globalAiModel);
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [capturedImage, setCapturedImage] = useState(null);
  const [multipleDetections, setMultipleDetections] = useState([]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        setErrorMsg("Gagal mengakses kamera. Anda masih bisa menggunakan tombol Galeri.");
      }
    };
    startCamera();

    const initAI = async () => {
      if (globalAiModel || isInitializing) return;
      isInitializing = true;
      try {
        if (!window.tflite) throw new Error("Mesin TFLite belum selesai diunduh.");
        window.tflite.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite/dist/');
        const loadedModel = await window.tflite.loadTFLiteModel('/yolov12-strise.tflite');
        globalAiModel = loadedModel;
        setModel(loadedModel);
      } catch (e) {
        console.error("Gagal menyiapkan AI:", e);
      } finally {
        isInitializing = false;
      }
    };

    if (!model) initAI();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [model]);

  // main logic & bounding box
  const processDetection = async (sourceElement, isVideo) => {
    if (!model) return;
    setIsScanning(true); 
    setErrorMsg("");
    await new Promise(r => setTimeout(r, 50));

    try {
      const tf = window.tf; 
      const tensor = tf.browser.fromPixels(sourceElement).resizeBilinear([640, 640]).expandDims(0).div(255.0); 
      const prediction = await model.predict(tensor); 
      const outputData = prediction.dataSync();
      const shape = prediction.shape; 
      tf.dispose(tensor); if (prediction) tf.dispose(prediction);
      
      let boxes = [];
      const numAnchors = shape[1] === 11 ? shape[2] : shape[1];
      
      for (let a = 0; a < numAnchors; a++) {
        let bestClassConfidence = 0;
        let bestClassId = 0;
        
        for (let c = 0; c < 7; c++) {
          const prob = shape[1] === 11 ? outputData[(4 + c) * numAnchors + a] : outputData[a * 11 + 4 + c];
          if (prob > bestClassConfidence) {
            bestClassConfidence = prob;
            bestClassId = c + 1; 
          }
        }

        if (bestClassConfidence > 0.3) {
          const cx = shape[1] === 11 ? outputData[0 * numAnchors + a] : outputData[a * 11 + 0];
          const cy = shape[1] === 11 ? outputData[1 * numAnchors + a] : outputData[a * 11 + 1];
          const w  = shape[1] === 11 ? outputData[2 * numAnchors + a] : outputData[a * 11 + 2];
          const h  = shape[1] === 11 ? outputData[3 * numAnchors + a] : outputData[a * 11 + 3];
          
          boxes.push({
            classId: bestClassId, confidence: bestClassConfidence,
            cx, cy, w, h,
            xmin: cx - w/2, ymin: cy - h/2, xmax: cx + w/2, ymax: cy + h/2
          });
        }
      }

      if (boxes.length === 0) throw new Error("Tidak ada penyakit terdeteksi. Pastikan gambar terlihat jelas.");

      boxes.sort((a, b) => b.confidence - a.confidence); 
      const finalBoxes = [];
      while (boxes.length > 0) {
        const bestBox = boxes.shift();
        finalBoxes.push(bestBox);
        boxes = boxes.filter(box => calculateIoU(bestBox, box) < 0.45); 
      }

      let isNormalized = false;
      const maxCoord = Math.max(...finalBoxes.map(b => Math.max(b.cx, b.cy, b.w, b.h)));
      if (maxCoord <= 1.5) isNormalized = true;

      const canvas = document.createElement('canvas');
      const maxDim = 1080; 
      let cWidth = isVideo ? sourceElement.videoWidth : sourceElement.naturalWidth;
      let cHeight = isVideo ? sourceElement.videoHeight : sourceElement.naturalHeight;
      
      if (cWidth > maxDim || cHeight > maxDim) {
        const ratio = Math.min(maxDim / cWidth, maxDim / cHeight);
        cWidth *= ratio;
        cHeight *= ratio;
      }
      canvas.width = cWidth;
      canvas.height = cHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(sourceElement, 0, 0, cWidth, cHeight);
      
      const uniqueClassIds = [...new Set(finalBoxes.map(b => b.classId))];
      const { data: catalogs } = await supabase.from('disease_catalogs').select('*').in('id', uniqueClassIds);
      const catalogMap = {};
      if (catalogs) catalogs.forEach(cat => catalogMap[cat.id] = cat);

      const uiColors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

      const enrichedBoxes = finalBoxes.map(box => ({
        ...box,
        diseaseName: catalogMap[box.classId]?.name || 'Penyakit Tidak Dikenal'
      }));

      enrichedBoxes.forEach(box => {
        let x, y, width, height;
        if (isNormalized) {
            x = box.xmin * cWidth; y = box.ymin * cHeight;
            width = box.w * cWidth; height = box.h * cHeight;
        } else {
            x = box.xmin * (cWidth / 640); y = box.ymin * (cHeight / 640);
            width = box.w * (cWidth / 640); height = box.h * (cHeight / 640);
        }

        x = Math.max(0, x); y = Math.max(0, y);
        width = Math.min(width, cWidth - x); height = Math.min(height, cHeight - y);
        
        const boxColor = uiColors[box.classId % uiColors.length];

        ctx.strokeStyle = boxColor;
        ctx.lineWidth = Math.max(3, cWidth / 300);
        ctx.strokeRect(x, y, width, height);
        
        const label = `${box.diseaseName} ${(box.confidence * 100).toFixed(0)}%`;
        const fontSize = Math.max(14, Math.floor(cWidth / 45));
        ctx.font = `bold ${fontSize}px sans-serif`;
        const textWidth = ctx.measureText(label).width;
        
        const labelY = y > (fontSize + 10) ? y - (fontSize + 10) : y;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(x, labelY, textWidth + 12, fontSize + 10);
        
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, x + 6, labelY + fontSize + 4);
      });

      const capturedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(capturedBase64);

      setMultipleDetections(enrichedBoxes);

      const primaryDetection = enrichedBoxes[0];
      const primaryCatalog = catalogMap[primaryDetection.classId];
      
      setResult({ confidence: primaryDetection.confidence, disease_catalog_id: primaryDetection.classId, ...primaryCatalog });

      // SIMPAN HASIL KE DATABASE SUPABASE
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: dbError } = await supabase.from('disease_histories').insert([{ 
          user_id: user.id, 
          disease_catalog_id: primaryDetection.classId, 
          confidence: primaryDetection.confidence,
          image_data: capturedBase64,
          detection_details: enrichedBoxes 
        }]);

        // error handling supabase
        if (dbError) {
          console.error("Gagal Insert Database:", dbError);
          alert(`⚠️ Riwayat Gagal Tersimpan!\n\nPastikan kolom "detection_details" (tipe: jsonb) sudah ada di tabel disease_histories.\n\nPesan Supabase: ${dbError.message}`);
        }

        await supabase.from('notifications').insert([{
          user_id: user.id,
          category: 'system',
          type: 'Diagnosa AI',
          title: `Terdeteksi: ${primaryCatalog.name} ${finalBoxes.length > 1 ? `(+${finalBoxes.length - 1} anomali lainnya)` : ''}`,
          description: `Terdapat total ${finalBoxes.length} titik infeksi. Silakan cek rencana penanganan.`,
          location: isVideo ? 'Pemindaian Kamera' : 'Unggahan Galeri'
        }]);
      }

    } catch (err) {
      setErrorMsg(err.message); 
    } finally {
      setIsScanning(false);
    }
  };

  const handleCameraScan = () => {
    if (videoRef.current) processDetection(videoRef.current, true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => processDetection(img, false);
  };

  if (!result) {
    return (
      <div className="h-[100dvh] w-full bg-[#111111] flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className="flex-none w-full z-50 flex justify-between items-center p-6">
          <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-slate-900 active:scale-95 transition-transform shadow-lg">
            <ArrowLeft size={24} />
          </button>
          <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-900">Live Kamera</span>
          </div>
        </header>

        {errorMsg && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-red-100/90 text-red-800 p-4 rounded-xl text-center text-sm font-bold z-50 shadow-xl">
            {errorMsg}
          </div>
        )}
        
        // cam area
        <div className="flex-1 w-full flex flex-col items-center justify-center relative px-6 overflow-hidden">
          <div className="relative w-full max-w-xs sm:max-w-sm aspect-square rounded-[2rem] overflow-hidden shadow-2xl mb-4 bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 border-[3px] border-transparent pointer-events-none z-30">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-[#ef4444] rounded-tl-[2rem]"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-[#ef4444] rounded-tr-[2rem]"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-[#ef4444] rounded-bl-[2rem]"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-[#ef4444] rounded-br-[2rem]"></div>
            </div>

            <div className="absolute bottom-4 w-full flex justify-center z-30 px-4">
              <span className="bg-[#1a1a1a]/80 backdrop-blur-md text-white/90 px-5 py-2 rounded-full text-xs font-medium border border-white/5 text-center shadow-lg">
                Arahkan kamera ke daun atau buah stroberi yang ingin diperiksa. Pastikan pencahayaan cukup dan fokus.
              </span>
            </div>
          </div>
        </div>

       //action buttons
        <div className="flex-none bg-white rounded-t-[2.5rem] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4">
          {!model ? (
            <div className="flex-1 flex justify-center items-center gap-3 text-slate-500 py-3">
              <Loader2 size={24} className="animate-spin text-red-600" />
              <span className="text-sm font-bold animate-pulse">Menyiapkan AI...</span>
            </div>
          ) : (
            <button 
              onClick={handleCameraScan} 
              disabled={isScanning} 
              className="flex-1 flex items-center justify-center gap-3 bg-[#dc2626] text-white rounded-[1.25rem] py-4 shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {isScanning ? (
                <><Loader2 size={24} className="animate-spin" /><span className="font-bold text-base">Memproses...</span></>
              ) : (
                <><Scan size={24} /><span className="font-bold text-base">Pindai</span></>
              )}
            </button>
          )}
          
          <div className="flex items-center justify-center">
            <button 
              onClick={() => fileInputRef.current.click()} 
              className="w-[56px] h-[56px] flex items-center justify-center bg-slate-50 text-slate-600 rounded-[1.25rem] border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all shrink-0"
            >
              <ImagePlus size={24} strokeWidth={2.5} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          </div>
        </div>
      </div>
    );
  }

  const displayImage = capturedImage || DISEASE_IMAGES[result.disease_catalog_id] || DISEASE_IMAGES.default;

  const uniqueDiseaseNames = [...new Set(multipleDetections.map(det => det.diseaseName))];
  const diseaseListString = uniqueDiseaseNames.join(', ');

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
      <header className="absolute top-0 w-full z-50 flex justify-between items-center p-6">
        <button onClick={() => { setResult(null); setCapturedImage(null); setMultipleDetections([]); }} className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-full shadow-lg text-slate-900 active:scale-95"><ArrowLeft size={24} /></button>
      </header>
      
      <section className="relative w-full h-[442px] md:h-[530px] bg-slate-900 rounded-br-[4rem] overflow-hidden">
        <img alt="Hasil Deteksi" className="w-full h-full object-contain md:object-cover object-center" src={displayImage} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
      </section>
      
      <main className="relative z-10 -mt-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-6 border border-slate-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 pr-4">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1 block">Diagnosis Utama</span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mb-2">{result.name}</h1>
            </div>
            <div className="flex flex-col items-center justify-center bg-red-50 text-red-800 p-4 rounded-2xl shrink-0 min-w-[80px]">
              <span className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-80 text-center">Akurasi</span>
              <span className="text-2xl font-bold leading-none">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {multipleDetections.length > 1 && (
          <div className="mb-6 bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-amber-200/50 flex items-center justify-center text-amber-800 shrink-0">
               <span className="font-bold">{multipleDetections.length}</span>
             </div>
             <p className="text-xs md:text-sm text-amber-900 font-medium leading-relaxed">
               Strise mendeteksi <b>{multipleDetections.length} titik anomali</b> ({diseaseListString}) pada gambar. Lihat kotak berwarna pada gambar untuk detail spesifiknya.
             </p>
          </div>
        )}

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Gejala Teridentifikasi</h2>
          <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-1">
              <Circle size={20} />
            </div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{result.symptoms}</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Rekomendasi Penanganan Utama</h2>
          <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 text-teal-700 mt-1">
              <Icon iconNode={strawberry} className="w-5 h-5" />
            </div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{result.treatment}</p>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/90 backdrop-blur-md pt-4 pb-6 px-6 flex justify-center border-t border-slate-100">
        <button onClick={() => navigate('/history')} className="w-full max-w-4xl relative rounded-2xl bg-gradient-to-r from-red-700 to-red-600 text-white py-5 px-8 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 hover:scale-[1.01]">
          <Save size={24} />
          <span className="font-bold text-lg">Lihat di Riwayat</span>
        </button>
      </div>
    </div>
  );
}