import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../lib/api';

const STYLES = ['Solo', 'Couple', 'Family', 'Group'];
const BUDGETS = ['Budget', 'Mid-range', 'Luxury'];
const BUDGET_MAP = { Budget: 'BUDGET', 'Mid-range': 'MID_RANGE', Luxury: 'LUXURY' };

export default function CreatePost() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', body: '', destination: '', hashtags: '',
    duration: 5, budget: 'Mid-range', travelStyle: 'Solo',
  });

  const handlePhotos = (e) => {
    const newFiles = Array.from(e.target.files).slice(0, 10 - files.length);
    setFiles((f) => [...f, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((p) => [...p, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (i) => {
    setPreviews((p) => p.filter((_, idx) => idx !== i));
    setFiles((f) => f.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.destination.trim()) {
      setError('Title and destination are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('body', form.body);
      formData.append('destination', form.destination);
      formData.append('duration', form.duration);
      formData.append('budget', BUDGET_MAP[form.budget]);
      formData.append('travelStyle', JSON.stringify([form.travelStyle.toUpperCase()]));
      const tags = form.hashtags.split(/[\s,#]+/).filter(Boolean);
      formData.append('hashtags', JSON.stringify(tags));

      if (files.length > 0) {
        files.forEach((f) => formData.append('photos', f));
      } else {
        const photoUrls = [`https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop`];
        formData.append('photoUrls', JSON.stringify(photoUrls));
      }

      const post = await api.post('/posts', formData);
      navigate(`/post/${post.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-neutral-200)' }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: 14, color: 'var(--color-neutral-400)', fontWeight: 500 }}>Cancel</button>
        <h1 className="text-h3">New Entry</h1>
        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-sm"
          disabled={submitting}
        >
          {submitting ? '...' : 'Post'}
        </button>
      </header>

      <form style={{ padding: '20px' }} onSubmit={handleSubmit}>
        {/* Photo upload */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: previews.length > 0 ? 0 : '32px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 20,
            background: 'var(--color-neutral-50)',
            overflow: 'hidden',
          }}
        >
          {previews.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, padding: 12, overflowX: 'auto' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={src} alt="" style={{ width: 100, height: 100, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                    style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >×</button>
                </div>
              ))}
              {previews.length < 10 && (
                <div style={{ width: 100, height: 100, borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 28, color: 'var(--color-neutral-400)' }}>+</div>
              )}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-neutral-700)' }}>Tap to add photos</div>
              <div className="text-caption">Up to 10 photos</div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} />

        {/* Title */}
        <textarea
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Give your trip a name..."
          style={{ width: '100%', fontSize: 22, fontFamily: 'var(--font-display)', fontStyle: 'italic', border: 'none', outline: 'none', resize: 'none', marginBottom: 16, lineHeight: 1.3, color: 'var(--color-neutral-900)', background: 'transparent' }}
          rows={2}
        />

        {/* Body */}
        <textarea
          className="input"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Tell your story..."
          rows={4}
          style={{ marginBottom: 16, resize: 'none' }}
        />

        {/* Destination */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Destination</label>
          <input
            className="input"
            placeholder="📍 Where did you go?"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
        </div>

        {/* Hashtags */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Hashtags</label>
          <input
            className="input"
            placeholder="#BaliAdventure #SunriseVibes..."
            value={form.hashtags}
            onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
          />
        </div>

        {/* Duration */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Duration: {form.duration} days</label>
          <input
            type="range" min="1" max="30"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--color-primary-400)' }}
          />
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Budget</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {BUDGETS.map((b) => (
              <button
                key={b}
                type="button"
                className={`chip ${form.budget === b ? 'active' : ''}`}
                onClick={() => setForm({ ...form, budget: b })}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Travel style */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Travel Style</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {STYLES.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${form.travelStyle === s ? 'active' : ''}`}
                onClick={() => setForm({ ...form, travelStyle: s })}
                style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ marginBottom: 12 }}>
          {submitting ? 'Sharing...' : 'Share Experience'}
        </button>
        <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate(-1)}>
          Save Draft
        </button>
      </form>
    </PageWrapper>
  );
}
