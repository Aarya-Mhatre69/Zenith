import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';

const BG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=1400&fit=crop&auto=format&q=85';

export default function Onboarding() {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const [mode, setMode] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          height: 200,
          background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${BG}) center/cover`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 4,
        }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', color: '#fff' }}>Zenith</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Your world, your story</p>
        </div>

        <div style={{ flex: 1, padding: '32px 24px' }}>
          <h2 className="text-h2" style={{ marginBottom: 8 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-caption" style={{ marginBottom: 28 }}>
            {mode === 'login' ? 'Sign in to continue your journey' : 'Join 50,000+ travelers worldwide'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Username</label>
                <input
                  className="input"
                  type="text"
                  placeholder="wanderlust_you"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  minLength={3}
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@travel.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Get Started'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <span style={{ color: 'var(--color-neutral-400)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: 14 }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          <button
            onClick={() => setMode(null)}
            style={{ display: 'block', margin: '16px auto 0', fontSize: 14, color: 'var(--color-neutral-400)' }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 'max(48px, env(safe-area-inset-bottom))',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.72) 100%)',
      }} />

      <div style={{ position: 'relative', width: '100%', padding: '0 24px' }}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 48,
            fontStyle: 'italic',
            color: '#fff',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Zenith Travel
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.88)',
            fontSize: 17,
            letterSpacing: 0.3,
          }}>
            Explore the world through real stories
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <button className="btn btn-primary btn-full" onClick={() => setMode('register')} style={{ fontSize: 16 }}>
            Get Started
          </button>
          <button className="btn btn-ghost-white btn-full" onClick={() => setMode('login')} style={{ fontSize: 16 }}>
            I already have an account
          </button>
        </motion.div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </motion.div>
  );
}
