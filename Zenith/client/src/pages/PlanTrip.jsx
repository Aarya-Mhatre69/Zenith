import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import { BackHeader } from '../components/layout/Header';
import api from '../lib/api';

const STEPS = 4;
const TRAVEL_STYLES = ['Adventure', 'Culture', 'Food', 'Relaxation', 'Nature', 'Nightlife'];
const BUDGET_OPTIONS = [
  { value: 'BACKPACKER', label: 'Backpacker', desc: 'Under $50/day', icon: '🎒' },
  { value: 'BUDGET', label: 'Budget', desc: '$50–100/day', icon: '💚' },
  { value: 'MID_RANGE', label: 'Mid-range', desc: '$100–200/day', icon: '✈️' },
  { value: 'LUXURY', label: 'Luxury', desc: '$200+/day', icon: '💎' },
];
const COMPANION_OPTIONS = ['Solo', 'Partner', 'Friends', 'Family'];

const LOADING_MESSAGES = [
  'Finding hidden gems...',
  'Optimizing your route...',
  'Building your perfect day...',
  'Curating local experiences...',
  'Calculating the best budget...',
  'Almost ready — adding insider tips...',
];

export default function PlanTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    destination: '',
    days: 5,
    travelStyle: [],
    budget: 'MID_RANGE',
    companions: 'Solo',
    startDate: '',
    endDate: '',
  });

  const toggleStyle = (style) => {
    setForm((f) => ({
      ...f,
      travelStyle: f.travelStyle.includes(style)
        ? f.travelStyle.filter((s) => s !== style)
        : [...f.travelStyle, style],
    }));
  };

  const canProceed = () => {
    if (step === 1) return form.destination.trim().length > 0;
    if (step === 2) return form.days >= 1 && form.days <= 30;
    if (step === 3) return form.travelStyle.length > 0;
    return true;
  };

  const generate = async () => {
    setError('');
    setGenerating(true);
    const interval = setInterval(() => {
      setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length);
    }, 2200);

    try {
      const payload = {
        destination: form.destination,
        days: form.days,
        budget: form.budget,
        travelStyle: form.travelStyle.map((s) => s.toUpperCase()),
        companions: form.companions,
        dates: form.startDate && form.endDate ? `${form.startDate} to ${form.endDate}` : undefined,
      };
      const itinerary = await api.post('/ai/generate-itinerary', payload);
      clearInterval(interval);
      navigate(`/itinerary/${itinerary.id}`);
    } catch (err) {
      clearInterval(interval);
      setGenerating(false);
      setError(err.message || 'Generation failed. Please try again.');
    }
  };

  if (generating) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#fff' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 72, marginBottom: 32 }}
        >
          🌍
        </motion.div>
        <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: 12, color: 'var(--color-neutral-900)' }}>
          Creating your journey
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingMsg}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ color: 'var(--color-neutral-400)', fontSize: 16, textAlign: 'center', minHeight: 28 }}
          >
            {LOADING_MESSAGES[loadingMsg]}
          </motion.p>
        </AnimatePresence>
        <div style={{ marginTop: 40, width: '100%', maxWidth: 260 }}>
          <div className="progress-bar">
            <motion.div
              className="progress-bar__fill"
              initial={{ width: '5%' }}
              animate={{ width: '95%' }}
              transition={{ duration: 15, ease: 'easeInOut' }}
            />
          </div>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--color-neutral-400)' }}>
          Powered by Claude AI · Usually takes 10–20 seconds
        </p>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackHeader title="Plan Your Trip" />

      <div style={{ padding: '24px 20px' }}>
        {/* Step indicators */}
        <div className="step-indicator">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={`step-dot ${i + 1 < step ? 'completed' : ''} ${i + 1 === step ? 'active' : ''}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Destination */}
            {step === 1 && (
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', marginBottom: 8 }}>
                  Where to?
                </h1>
                <p style={{ color: 'var(--color-neutral-400)', fontSize: 15, marginBottom: 28 }}>
                  Enter any city, country, or region
                </p>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <input
                    className="input"
                    style={{ paddingLeft: 44, fontSize: 18 }}
                    placeholder="Bali, Tokyo, Paris..."
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
                  {['Bali', 'Kyoto', 'Paris', 'Marrakech', 'Santorini', 'Bangkok'].map((d) => (
                    <button
                      key={d}
                      className="chip"
                      onClick={() => setForm({ ...form, destination: d })}
                      style={form.destination === d ? { background: 'var(--color-primary-400)', color: '#fff', borderColor: 'var(--color-primary-400)' } : {}}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Duration */}
            {step === 2 && (
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', marginBottom: 8 }}>
                  How long?
                </h1>
                <p style={{ color: 'var(--color-neutral-400)', fontSize: 15, marginBottom: 36 }}>
                  Drag to set your trip length
                </p>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <span style={{ fontSize: 64, fontWeight: 700, color: 'var(--color-primary-400)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                    {form.days}
                  </span>
                  <span style={{ fontSize: 24, color: 'var(--color-neutral-400)', marginLeft: 8 }}>days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--color-primary-400)', height: 4 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--color-neutral-400)' }}>
                  <span>1 day</span>
                  <span>30 days</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
                  {[3, 5, 7, 10, 14].map((d) => (
                    <button
                      key={d}
                      className="chip"
                      onClick={() => setForm({ ...form, days: d })}
                      style={form.days === d ? { background: 'var(--color-primary-400)', color: '#fff', borderColor: 'var(--color-primary-400)' } : {}}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', marginBottom: 8 }}>
                  Your style
                </h1>
                <p style={{ color: 'var(--color-neutral-400)', fontSize: 15, marginBottom: 24 }}>
                  Select all that match your vibe
                </p>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--color-neutral-700)' }}>Travel Style (pick multiple)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {TRAVEL_STYLES.map((s) => (
                      <button
                        key={s}
                        className={`chip ${form.travelStyle.includes(s) ? 'active' : ''}`}
                        onClick={() => toggleStyle(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--color-neutral-700)' }}>Budget</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {BUDGET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setForm({ ...form, budget: opt.value })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${form.budget === opt.value ? 'var(--color-primary-400)' : 'var(--color-neutral-200)'}`,
                          background: form.budget === opt.value ? 'var(--color-primary-50)' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{opt.icon}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{opt.desc}</div>
                        </div>
                        {form.budget === opt.value && (
                          <div style={{ marginLeft: 'auto', color: 'var(--color-primary-400)' }}>✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--color-neutral-700)' }}>Traveling as</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {COMPANION_OPTIONS.map((c) => (
                      <button
                        key={c}
                        className={`chip ${form.companions === c ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, companions: c })}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Dates */}
            {step === 4 && (
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', marginBottom: 8 }}>
                  When?
                </h1>
                <p style={{ color: 'var(--color-neutral-400)', fontSize: 15, marginBottom: 28 }}>
                  Optional — helps AI suggest seasonal highlights
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Check-in</label>
                    <input
                      className="input"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Check-out</label>
                    <input
                      className="input"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div style={{ padding: '20px', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
                  <h3 className="text-h3" style={{ marginBottom: 14 }}>Your trip summary</h3>
                  {[
                    { label: 'Destination', value: form.destination },
                    { label: 'Duration', value: `${form.days} days` },
                    { label: 'Style', value: form.travelStyle.join(', ') || 'Any' },
                    { label: 'Budget', value: BUDGET_OPTIONS.find((b) => b.value === form.budget)?.label },
                    { label: 'Traveling as', value: form.companions },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-neutral-200)', fontSize: 14 }}>
                      <span style={{ color: 'var(--color-neutral-400)' }}>{label}</span>
                      <span style={{ fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{ marginTop: 16, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: 14 }}>
                    {error}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          {step > 1 && (
            <button
              className="btn btn-ghost"
              onClick={() => setStep((s) => s - 1)}
              style={{ flex: 1 }}
            >
              ← Back
            </button>
          )}
          {step < STEPS ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              style={{ flex: 1, opacity: canProceed() ? 1 : 0.5 }}
            >
              Continue →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={generate}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))',
                fontSize: 15,
              }}
            >
              ✨ Generate My Itinerary
            </button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
