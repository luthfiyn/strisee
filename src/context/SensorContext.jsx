import React, { createContext, useContext, useState, useEffect } from 'react';

// Membuat wadah data global
const SensorContext = createContext();

export function SensorProvider({ children }) {
  const [sensor, setSensor] = useState({ ph_value: 6.0, moisture_value: 70 });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Mesin simulasi dipindah ke pusat (berjalan 1x untuk seluruh aplikasi)
    const simulationInterval = setInterval(() => {
      setSensor(prev => {
        let newPh = prev.ph_value + (Math.random() * 0.2 - 0.1);
        newPh = Math.max(5.0, Math.min(7.0, newPh));

        let newMoisture = prev.moisture_value + (Math.random() * 4 - 2);
        newMoisture = Math.max(50, Math.min(90, newMoisture));

        const isPhOptimal = newPh >= 5.5 && newPh <= 6.5;
        const isMoistureOptimal = newMoisture >= 60 && newMoisture <= 80;

        // LOGIKA PERINGATAN OTOMATIS
        setAlerts(prevAlerts => {
          let newAlerts = [...prevAlerts];
          
          // Jika pH tidak normal & belum ada notifikasi pH, buat notifikasi baru!
          if (!isPhOptimal && !newAlerts.some(a => a.notifications.type === 'Peringatan pH')) {
            newAlerts.unshift({
              id: Date.now() + 1,
              notifications: { 
                type: 'Peringatan pH', 
                message: `Nilai pH tanah (${newPh.toFixed(1)}) di luar ambang batas (5.5 - 6.5). Cek saluran fertigasi.` 
              }
            });
          }
          
          // Jika Kelembaban tidak normal & belum ada notifikasi Kelembaban, buat notifikasi!
          if (!isMoistureOptimal && !newAlerts.some(a => a.notifications.type === 'Peringatan Kelembaban')) {
            newAlerts.unshift({
              id: Date.now() + 2,
              notifications: { 
                type: 'Peringatan Kelembaban', 
                message: `Kelembaban tanah (${newMoisture.toFixed(0)}%) di luar target optimal (60% - 80%).` 
              }
            });
          }
          
          return newAlerts;
        });

        return { ph_value: newPh, moisture_value: newMoisture };
      });
    }, 5000); // Sinkron update setiap 5 detik

    return () => clearInterval(simulationInterval);
  }, []);

  // Fungsi untuk menghapus notifikasi yang sudah dibaca
  const markAsRead = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <SensorContext.Provider value={{ sensor, alerts, markAsRead }}>
      {children}
    </SensorContext.Provider>
  );
}

// Hook kustom agar halaman lain mudah mengambil data
export const useSensor = () => useContext(SensorContext);