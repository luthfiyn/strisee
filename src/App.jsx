import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import TopHeader from './components/TopHeader';
import BottomNav from './components/BottomNav';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import DiagnosticResult from './pages/DiagnosticResult';
import HistoryPage from './pages/HistoryPage';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Halaman yang tidak butuh Header/Nav
  const hideLayout = path === '/login' || path === '/register';
  // Halaman yang tidak butuh Header (karena DiagnosticResult punya Header sendiri)
  const hideHeader = path === '/diagnostic';
  const isLogged = path !== '/' && !hideLayout;

  return (
    <>
      {!hideLayout && !hideHeader && <TopHeader navigate={navigate} isLogged={isLogged} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/diagnostic" element={<DiagnosticResult />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
      {!hideLayout && <BottomNav currentPage={path.replace('/', '')} navigate={navigate} />}
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