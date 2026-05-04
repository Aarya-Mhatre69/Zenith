import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useAuthStore from './store/authStore';
import { ToastProvider } from './components/ui/Toast';

import BottomNav from './components/layout/BottomNav';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ItineraryDetail from './pages/ItineraryDetail';
import CreatePost from './pages/CreatePost';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import PlanTrip from './pages/PlanTrip';
import HotelBooking from './pages/HotelBooking';
import LocalDiscovery from './pages/LocalDiscovery';
import PostDetail from './pages/PostDetail';
import HashtagFeed from './pages/HashtagFeed';

const NO_NAV_ROUTES = ['/auth', '/create', '/map'];

function AppShell() {
  const location = useLocation();
  const { user, loading, init } = useAuthStore();

  useEffect(() => { init(); }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, background: '#fff' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontStyle: 'italic', color: 'var(--color-primary-400)' }}>Zenith</div>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  const showNav = user && !NO_NAV_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/auth" element={!user ? <Onboarding /> : <Navigate to="/" replace />} />
          <Route path="/" element={user ? <Home /> : <Navigate to="/auth" replace />} />
          <Route path="/explore" element={user ? <Explore /> : <Navigate to="/auth" replace />} />
          <Route path="/itinerary/:id" element={user ? <ItineraryDetail /> : <Navigate to="/auth" replace />} />
          <Route path="/post/:id" element={user ? <PostDetail /> : <Navigate to="/auth" replace />} />
          <Route path="/create" element={user ? <CreatePost /> : <Navigate to="/auth" replace />} />
          <Route path="/map" element={user ? <MapView /> : <Navigate to="/auth" replace />} />
          <Route path="/profile/:username" element={user ? <Profile /> : <Navigate to="/auth" replace />} />
          <Route path="/plan" element={user ? <PlanTrip /> : <Navigate to="/auth" replace />} />
          <Route path="/hotel/:id" element={user ? <HotelBooking /> : <Navigate to="/auth" replace />} />
          <Route path="/hotel" element={user ? <HotelBooking /> : <Navigate to="/auth" replace />} />
          <Route path="/discover" element={user ? <LocalDiscovery /> : <Navigate to="/auth" replace />} />
          <Route path="/hashtag/:tag" element={user ? <HashtagFeed /> : <Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
        </Routes>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-shell">
          <AppShell />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
