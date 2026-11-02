import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import TopHeader from './components/TopHeader';
import BottomNav from './components/BottomNav';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import DiagnosticResult from './pages/DiagnosticResult';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage'; // Pastikan file ini ada

// Komponen Proteksi Rute
function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  if (session === undefined) return null; // Loading state
  return session ? children : <Navigate to="/login" />;
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Menyembunyikan elemen UI pada halaman tertentu
  const isAuthPage = path === '/login' || path === '/register';
  const isLanding = path === '/';
  const isDiagnostic = path === '/diagnostic';
  
  const hideTopHeader = isAuthPage || isDiagnostic;
  const hideBottomNav = isAuthPage || isLanding; // Sembunyikan navigasi bawah di Landing Page
  const isLogged = !isLanding && !isAuthPage;

  return (
    <>
      {!hideTopHeader && <TopHeader navigate={navigate} isLogged={isLogged} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rute yang dilindungi */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
        <Route path="/diagnostic" element={<ProtectedRoute><DiagnosticResult /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
      {!hideBottomNav && <BottomNav currentPage={path.replace('/', '')} navigate={navigate} />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}