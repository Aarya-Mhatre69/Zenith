import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import ActivityCard from '../components/itinerary/ActivityCard';
import { useToast } from '../components/ui/Toast';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

const DEST_PHOTOS = {
  bali:           '1537996194471-e657df975ab4',
  kyoto:          '1493976040374-85c8e12f0c0e',
  paris:          '1499678779905-54e0b21a94e2',
  marrakech:      '1539020140153-5a0e2c1fc72e',
  santorini:      '1570077188670-e3a8d69ac5ff',
  bangkok:        '1528360983277-13d401cdc186',
  tokyo:          '1542051841857-5f90071e7483',
  'amalfi coast': '1499678779905-54e0b21a94e2',
  vietnam:        '1540575467537-786dd4da2f1f',
  morocco:        '1539020140153-5a0e2c1fc72e',
  bali:           '1537996194471-e657df975ab4',
};

function getHeroPhoto(destination, id) {
  const key = destination?.toLowerCase();
  const photoId = Object.entries(DEST_PHOTOS).find(([k]) => key?.includes(k))?.[1]
    || '1476514525535-07fb3b4ae5f1';
  return `https://images.unsplash.com/photo-${photoId}?w=800&h=440&fit=crop&auto=format&sig=${id}`;
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'var(--color-primary-400)' : 'none'} stroke={filled ? 'var(--color-primary-400)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

export default function ItineraryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useAuthStore((s) => s.user);

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [saved, setSaved] = useState(false);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    api.get(`/itineraries/${id}`)
      .then((data) => { setItinerary(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const isOwner = currentUser?.id === itinerary?.authorId;

  const handleSave = async () => {
    const prev = saved;
    setSaved((s) => !s);
    try {
      await api.post(`/itineraries/${id}/save`);
      toast(prev ? 'Removed from saved' : '🔖 Saved to your trips', prev ? 'info' : 'success');
    } catch {
      setSaved(prev);
      toast('Failed to save', 'error');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/itinerary/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: itinerary.title, text: `Check out this ${itinerary.days}-day trip to ${itinerary.destination}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard', 'success');
      }
    } catch {}
  };

  const handleClone = async () => {
    setCloning(true);
    try {
      const clone = await api.post(`/itineraries/${id}/clone`);
      toast('✨ Itinerary cloned — customize it now', 'success');
      navigate(`/itinerary/${clone.id}/edit`);
    } catch {
      toast('Failed to clone itinerary', 'error');
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      </PageWrapper>
    );
  }

  if (!itinerary) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 48 }}>🗺️</div>
          <h3 className="text-h3" style={{ margin: '16px 0 8px' }}>Itinerary not found</h3>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </PageWrapper>
    );
  }

  const currentDay = itinerary.days_data?.[activeDay];
  const heroPhoto = getHeroPhoto(itinerary.destination, itinerary.id);
  const estimatedTotal = itinerary.days_data
    ?.flatMap((d) => d.activities)
    .reduce((sum, a) => sum + (a.estimatedCost || 0), 0);

  return (
    <PageWrapper>
      {/* Sticky header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#fff', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--color-neutral-200)' }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--color-neutral-700)', display: 'flex', alignItems: 'center', minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
          <BackIcon />
        </button>
        <span className="text-h3" style={{ flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px', fontSize: 15 }}>
          {itinerary.title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={handleShare} style={{ color: 'var(--color-neutral-700)', minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Share">
            <ShareIcon />
          </button>
          <button onClick={handleSave} style={{ color: saved ? 'var(--color-primary-400)' : 'var(--color-neutral-700)', minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label={saved ? 'Unsave' : 'Save'}>
            <BookmarkIcon filled={saved} />
          </button>
          {isOwner && (
            <button onClick={() => navigate(`/itinerary/${id}/edit`)} style={{ color: 'var(--color-neutral-700)', minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Edit">
              <EditIcon />
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        <img src={heroPhoto} alt={itinerary.destination} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 4 }}>📍 {itinerary.destination}</div>
          {itinerary.isAiGenerated && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(29,158,117,0.85)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(8px)', marginTop: 4 }}>
              ✨ AI Generated
            </div>
          )}
        </div>
      </div>

      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--color-neutral-100)' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => navigate(`/profile/${itinerary.author?.username}`)}
        >
          {itinerary.author?.avatarUrl ? (
            <img src={itinerary.author.avatarUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--color-primary-400)' }}>
              {itinerary.author?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>@{itinerary.author?.username}</div>
            <div className="text-caption">Trip author</div>
          </div>
        </div>
        {!isOwner && (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/profile/${itinerary.author?.username}`)}>
            Follow
          </button>
        )}
        {isOwner && (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/itinerary/${id}/edit`)}>
            ✏️ Edit
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-neutral-100)' }}>
        {[
          { icon: '🗓', label: 'Days', value: itinerary.days },
          { icon: '💵', label: 'Budget', value: estimatedTotal ? `$${estimatedTotal.toLocaleString()}` : itinerary.estimatedCost ? `$${itinerary.estimatedCost.toLocaleString()}` : '—' },
          { icon: '⭐', label: 'Rating', value: itinerary.rating?.toFixed(1) || '4.8' },
          { icon: '🔖', label: 'Saves', value: itinerary._count?.saves ?? itinerary.saveCount ?? 0 },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '14px 0', borderRight: i < 3 ? '1px solid var(--color-neutral-100)' : 'none', background: 'var(--color-neutral-50)' }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-neutral-400)', marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Day tabs */}
      {itinerary.days_data?.length > 0 && (
        <div className="scroll-x" style={{ padding: '14px 20px 0', borderBottom: '1px solid var(--color-neutral-100)', gap: 8 }}>
          {itinerary.days_data.map((day, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                whiteSpace: 'nowrap',
                marginBottom: 10,
                background: activeDay === i ? 'var(--color-primary-400)' : 'var(--color-neutral-100)',
                color: activeDay === i ? '#fff' : 'var(--color-neutral-700)',
                transition: 'all 0.15s',
              }}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      )}

      {/* Day theme */}
      {currentDay?.theme && (
        <div style={{ padding: '16px 20px 8px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontStyle: 'italic' }}>
            {currentDay.theme}
          </h2>
        </div>
      )}

      {/* Activities */}
      <div style={{ padding: '8px 20px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {currentDay?.activities?.length > 0 ? (
              currentDay.activities.map((act, i) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <ActivityCard activity={act} index={i} />
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-neutral-400)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                <p>No activities for this day</p>
                {isOwner && (
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => navigate(`/itinerary/${id}/edit`)}>
                    Add activities
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn btn-accent btn-full"
          onClick={() => navigate(`/map?itineraryId=${id}`)}
        >
          🗺️ Navigate This Route
        </button>
        {!isOwner && (
          <button
            className="btn btn-ghost btn-full"
            onClick={handleClone}
            disabled={cloning}
          >
            {cloning ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Cloning...
              </span>
            ) : '✏️ Clone & Customize'}
          </button>
        )}
        {isOwner && (
          <button className="btn btn-ghost btn-full" onClick={() => navigate(`/itinerary/${id}/edit`)}>
            ✏️ Edit This Itinerary
          </button>
        )}
      </div>
    </PageWrapper>
  );
}
