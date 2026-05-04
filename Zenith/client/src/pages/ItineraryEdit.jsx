import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import { useToast } from '../components/ui/Toast';
import api from '../lib/api';

const TIME_OPTIONS = ['MORNING', 'AFTERNOON', 'EVENING'];
const TIME_ICONS = { MORNING: '☀️', AFTERNOON: '🌿', EVENING: '🌅' };
const TIME_COLORS = {
  MORNING:   { bg: '#FFF8E1', text: '#F57F17' },
  AFTERNOON: { bg: '#E8F5E9', text: '#2E7D32' },
  EVENING:   { bg: '#EDE7F6', text: '#4527A0' },
};

function ActivityEditor({ activity, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(activity);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const style = TIME_COLORS[activity.timeOfDay] || TIME_COLORS.MORNING;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.put(`/activities/${activity.id}`, draft);
      onUpdate(updated);
      setExpanded(false);
      toast('Activity saved', 'success');
    } catch {
      toast('Failed to save activity', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove this activity?')) return;
    try {
      await api.delete(`/activities/${activity.id}`);
      onDelete(activity.id);
      toast('Activity removed', 'info');
    } catch {
      toast('Failed to remove activity', 'error');
    }
  };

  return (
    <div style={{ marginBottom: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer', background: expanded ? style.bg : '#fff', transition: 'background 0.15s' }}
        onClick={() => setExpanded((e) => !e)}
      >
        <span style={{ fontSize: 18 }}>{draft.emoji || TIME_ICONS[draft.timeOfDay]}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-neutral-900)' }}>{draft.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{draft.timeOfDay} · {draft.location} · {draft.duration}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: style.text, background: style.bg, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            {draft.timeOfDay}
          </span>
          <span style={{ color: 'var(--color-neutral-400)', fontSize: 16, transition: 'transform 0.15s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '14px', background: 'var(--color-neutral-50)', borderTop: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Time of day */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Time of day</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setDraft((d) => ({ ...d, timeOfDay: t }))}
                      style={{
                        flex: 1, padding: '6px 0', borderRadius: 'var(--radius-sm)', border: '1.5px solid',
                        borderColor: draft.timeOfDay === t ? 'var(--color-primary-400)' : 'var(--color-neutral-200)',
                        background: draft.timeOfDay === t ? 'var(--color-primary-50)' : '#fff',
                        fontSize: 11, fontWeight: 600,
                        color: draft.timeOfDay === t ? 'var(--color-primary-600)' : 'var(--color-neutral-400)',
                        cursor: 'pointer',
                      }}
                    >
                      {TIME_ICONS[t]} {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji + Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Icon</label>
                  <input
                    className="input"
                    value={draft.emoji || ''}
                    onChange={(e) => setDraft((d) => ({ ...d, emoji: e.target.value }))}
                    style={{ textAlign: 'center', fontSize: 20, padding: '10px 8px' }}
                    maxLength={2}
                    placeholder="☀️"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Activity name *</label>
                  <input
                    className="input"
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder="Activity name"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Description</label>
                <textarea
                  className="input"
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  rows={3}
                  style={{ resize: 'vertical', fontSize: 13 }}
                  placeholder="What makes this special..."
                />
              </div>

              {/* Location + Duration row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Location</label>
                  <input className="input" value={draft.location} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} placeholder="Neighborhood" style={{ fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Duration</label>
                  <input className="input" value={draft.duration} onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))} placeholder="~2hr" style={{ fontSize: 13 }} />
                </div>
              </div>

              {/* Cost + Tips row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Est. Cost (USD)</label>
                  <input className="input" type="number" value={draft.estimatedCost || 0} onChange={(e) => setDraft((d) => ({ ...d, estimatedCost: e.target.value }))} placeholder="0" style={{ fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>Insider tip</label>
                  <input className="input" value={draft.tips || ''} onChange={(e) => setDraft((d) => ({ ...d, tips: e.target.value }))} placeholder="Local secret..." style={{ fontSize: 13 }} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  {saving ? 'Saving...' : '✓ Save changes'}
                </button>
                <button
                  onClick={handleDelete}
                  style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-danger)', color: 'var(--color-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DayPanel({ day, onActivityUpdate, onActivityDelete, onAddActivity }) {
  const [adding, setAdding] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '', timeOfDay: 'MORNING', emoji: '📍', location: '', duration: '~2hr', description: '', estimatedCost: 0 });
  const toast = useToast();

  const handleAdd = async () => {
    if (!newActivity.name.trim()) return;
    setAdding(true);
    try {
      const created = await api.post(`/activities/day/${day.id}`, newActivity);
      onAddActivity(day.id, created);
      setNewActivity({ name: '', timeOfDay: 'MORNING', emoji: '📍', location: '', duration: '~2hr', description: '', estimatedCost: 0 });
      toast('Activity added', 'success');
    } catch {
      toast('Failed to add activity', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
          {day.dayNumber}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Day {day.dayNumber}</div>
          {day.theme && <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{day.theme}</div>}
        </div>
      </div>

      {day.activities.map((act) => (
        <ActivityEditor
          key={act.id}
          activity={act}
          onUpdate={(updated) => onActivityUpdate(day.id, updated)}
          onDelete={(id) => onActivityDelete(day.id, id)}
        />
      ))}

      {/* Add activity inline */}
      <div style={{ borderRadius: 'var(--radius-md)', border: '1.5px dashed var(--color-neutral-200)', padding: '12px 14px', background: 'var(--color-neutral-50)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="input"
            value={newActivity.name}
            onChange={(e) => setNewActivity((n) => ({ ...n, name: e.target.value }))}
            placeholder="+ Add an activity..."
            style={{ flex: 1, fontSize: 13 }}
          />
          <select
            className="input"
            value={newActivity.timeOfDay}
            onChange={(e) => setNewActivity((n) => ({ ...n, timeOfDay: e.target.value }))}
            style={{ width: 120, fontSize: 12 }}
          >
            {TIME_OPTIONS.map((t) => <option key={t} value={t}>{TIME_ICONS[t]} {t}</option>)}
          </select>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !newActivity.name.trim()}
          className="btn btn-ghost btn-sm btn-full"
          style={{ opacity: !newActivity.name.trim() ? 0.5 : 1 }}
        >
          {adding ? 'Adding...' : '+ Add Activity'}
        </button>
      </div>
    </div>
  );
}

export default function ItineraryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingDay, setAddingDay] = useState(false);

  useEffect(() => {
    api.get(`/itineraries/${id}`)
      .then((data) => { setItinerary(data); setTitle(data.title); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveTitle = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.put(`/itineraries/${id}`, { title });
      setItinerary((i) => ({ ...i, title }));
      toast('Title saved', 'success');
    } catch {
      toast('Failed to save title', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDay = async () => {
    setAddingDay(true);
    try {
      const day = await api.post(`/itineraries/${id}/days`, {});
      setItinerary((i) => ({
        ...i,
        days_data: [...(i.days_data || []), day],
        days: (i.days || 0) + 1,
      }));
      toast(`Day ${day.dayNumber} added`, 'success');
    } catch {
      toast('Failed to add day', 'error');
    } finally {
      setAddingDay(false);
    }
  };

  const handleActivityUpdate = (dayId, updated) => {
    setItinerary((i) => ({
      ...i,
      days_data: i.days_data.map((d) =>
        d.id === dayId
          ? { ...d, activities: d.activities.map((a) => a.id === updated.id ? updated : a) }
          : d
      ),
    }));
  };

  const handleActivityDelete = (dayId, activityId) => {
    setItinerary((i) => ({
      ...i,
      days_data: i.days_data.map((d) =>
        d.id === dayId
          ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) }
          : d
      ),
    }));
  };

  const handleAddActivity = (dayId, created) => {
    setItinerary((i) => ({
      ...i,
      days_data: i.days_data.map((d) =>
        d.id === dayId ? { ...d, activities: [...d.activities, created] } : d
      ),
    }));
  };

  if (loading) return (
    <PageWrapper>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    </PageWrapper>
  );

  if (!itinerary) return (
    <PageWrapper>
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h3>Itinerary not found</h3>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Go back</button>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-neutral-200)', position: 'sticky', top: 0, background: '#fff', zIndex: 50 }}>
        <button onClick={() => navigate(`/itinerary/${id}`)} style={{ fontSize: 14, color: 'var(--color-neutral-400)', fontWeight: 500 }}>
          ← View
        </button>
        <h1 className="text-h3">Customize Trip</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/itinerary/${id}`)}
        >
          Done
        </button>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Title editor */}
        <div style={{ marginBottom: 28, padding: '16px', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--color-neutral-700)' }}>
            Trip title
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ flex: 1, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16 }}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSaveTitle}
              disabled={saving || title === itinerary.title}
            >
              {saving ? '...' : 'Save'}
            </button>
          </div>
          <div className="text-caption" style={{ marginTop: 6 }}>
            📍 {itinerary.destination} · {itinerary.days} days
          </div>
        </div>

        {/* Days */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="text-h3">Days & Activities</h2>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>Tap activity to edit</span>
          </div>

          {itinerary.days_data?.map((day) => (
            <DayPanel
              key={day.id}
              day={day}
              onActivityUpdate={handleActivityUpdate}
              onActivityDelete={handleActivityDelete}
              onAddActivity={handleAddActivity}
            />
          ))}
        </div>

        {/* Add day */}
        <button
          onClick={handleAddDay}
          disabled={addingDay}
          className="btn btn-ghost btn-full"
          style={{ marginBottom: 24 }}
        >
          {addingDay ? 'Adding day...' : `+ Add Day ${(itinerary.days_data?.length || 0) + 1}`}
        </button>
      </div>
    </PageWrapper>
  );
}
