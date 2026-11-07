import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import TopHeader from './components/TopHeader';
import BottomNav from './components/BottomNav';

import { SensorProvider } from './context/SensorContext'; 

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; 
import ResetPasswordConfirm from './pages/ResetPasswordConfirm'; // Halaman Reset
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import DiagnosticResult from './pages/DiagnosticResult';
import HistoryPage from './pages/HistoryPage';
import HistoryDetail from './pages/HistoryDetail'; 
import ProfilePage from './pages/ProfilePage';
import LearnMorePage from './pages/LearnMorePage';
import NotificationPage from './pages/NotificationPage';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  if (session === undefined) return null; 
  return session ? children : <Navigate to="/login" />;
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // PENANGKAP OTOMATIS: Mendeteksi jika user datang dari link email reset password
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Jika event adalah pemulihan sandi, paksa pindah ke halaman reset
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password-confirm', { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const isAuthPage = path === '/login' || path === '/register' || path === '/forgot-password' || path === '/reset-password-confirm';
  const isDiagnostic = path === '/diagnostic';
  const isLanding = path === '/';
  const isHistoryDetail = path.startsWith('/history/'); 
  const isLearnMore = path === '/learn-more';
  const isNotification = path === '/notifications';
  
  // Menyembunyikan navigasi global di halaman yang tidak membutuhkannya
  const hideTopHeader = isAuthPage || isDiagnostic || isHistoryDetail || isLearnMore || isNotification;
  const hideBottomNav = isAuthPage || isLanding || isDiagnostic || isHistoryDetail || isLearnMore || isNotification;
  
  const isLogged = !isLanding && !isAuthPage && !isLearnMore;

  return (
    <SensorProvider>
      {!hideTopHeader && <TopHeader navigate={navigate} isLogged={isLogged} />}
      
      <Routes>
        {/* RUTE PUBLIK */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/learn-more" element={<LearnMorePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Rute khusus pemulihan sandi (tersembunyi dari navigasi umum) */}
        <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
        
        {/* RUTE PRIVAT */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
        <Route path="/diagnostic" element={<ProtectedRoute><DiagnosticResult /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/history/:id" element={<ProtectedRoute><HistoryDetail /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />

      </Routes>
      
      {!hideBottomNav && <BottomNav currentPage={path.replace('/', '')} navigate={navigate} />}
    </SensorProvider>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}