import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import ItineraryCard from '../components/itinerary/ItineraryCard';
import PostCard from '../components/feed/PostCard';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

const TABS = ['Created', 'Saved', 'AI Trips'];

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function EmptyState({ icon, title, body, cta, onCta }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--color-neutral-400)' }}>
      <div style={{ fontSize: 56, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{body}</p>
      {cta && <button className="btn btn-primary" onClick={onCta}>{cta}</button>}
    </div>
  );
}

export default function MyTrips() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('Created');
  const [itineraries, setItineraries] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.get(`/users/${user.id}/itineraries`),
      api.get(`/users/${user.id}/saved`),
    ]).then(([itin, saves]) => {
      setItineraries(itin);
      setSaved(saves);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [user]);

  const aiTrips = itineraries.filter((i) => i.isAiGenerated);
  const myTrips = itineraries.filter((i) => !i.isAiGenerated);
  const savedItins = saved.filter((s) => s.itinerary).map((s) => s.itinerary);
  const savedPosts = saved.filter((s) => s.post).map((s) => s.post);

  return (
    <PageWrapper>
      {/* Header */}
      <header style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', color: 'var(--color-neutral-900)' }}>
          My Trips
        </h1>
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/plan')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <PlusIcon />
          Plan Trip
        </motion.button>
      </header>

      {/* Stats strip */}
      {!loading && (
        <div style={{ display: 'flex', gap: 0, padding: '16px 20px 0' }}>
          {[
            { value: itineraries.length, label: 'Created', color: 'var(--color-primary-400)' },
            { value: aiTrips.length, label: 'AI Trips', color: '#7F77DD' },
            { value: savedItins.length, label: 'Saved', color: 'var(--color-accent-400)' },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRight: i < 2 ? '1px solid var(--color-neutral-100)' : 'none', background: 'var(--color-neutral-50)', borderRadius: i === 0 ? 'var(--radius-md) 0 0 var(--radius-md)' : i === 2 ? '0 var(--radius-md) var(--radius-md) 0' : 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-neutral-200)', marginTop: 20 }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px 8px', fontSize: 13, fontWeight: 600,
              color: activeTab === tab ? 'var(--color-primary-400)' : 'var(--color-neutral-400)',
              borderBottom: activeTab === tab ? '2.5px solid var(--color-primary-400)' : '2.5px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'Created' && (
                myTrips.length === 0 ? (
                  <EmptyState
                    icon="🗺️"
                    title="No trips created yet"
                    body="Plan your first adventure or clone one from the community."
                    cta="Plan a Trip"
                    onCta={() => navigate('/plan')}
                  />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {myTrips.map((itin) => (
                      <ItineraryCard key={itin.id} itinerary={itin} showAuthor={false} compact />
                    ))}
                  </div>
                )
              )}

              {activeTab === 'Saved' && (
                savedItins.length === 0 && savedPosts.length === 0 ? (
                  <EmptyState
                    icon="🔖"
                    title="Nothing saved yet"
                    body="Bookmark itineraries and posts from the feed to find them here."
                    cta="Explore Feed"
                    onCta={() => navigate('/explore')}
                  />
                ) : (
                  <div>
                    {savedItins.length > 0 && (
                      <>
                        <h3 className="text-h3" style={{ marginBottom: 12 }}>Saved Itineraries</h3>
                        {savedItins.map((itin) => (
                          <ItineraryCard key={itin.id} itinerary={itin} />
                        ))}
                      </>
                    )}
                    {savedPosts.length > 0 && (
                      <>
                        <h3 className="text-h3" style={{ margin: '20px 0 12px' }}>Saved Posts</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {savedPosts.map((post) => (
                            <PostCard key={post.id} post={post} compact />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              )}

              {activeTab === 'AI Trips' && (
                aiTrips.length === 0 ? (
                  <EmptyState
                    icon="✨"
                    title="No AI trips yet"
                    body="Let our AI build a personalized itinerary for your next destination."
                    cta="Generate with AI"
                    onCta={() => navigate('/plan')}
                  />
                ) : (
                  <>
                    <div style={{ padding: '12px 14px', background: 'linear-gradient(135deg, var(--color-primary-50), #fff)', border: '1px solid var(--color-primary-100)', borderRadius: 'var(--radius-lg)', marginBottom: 16, fontSize: 13, color: 'var(--color-primary-600)' }}>
                      ✨ These itineraries were generated by AI — tap any to view, clone, or customize.
                    </div>
                    {aiTrips.map((itin) => (
                      <ItineraryCard key={itin.id} itinerary={itin} showAuthor={false} />
                    ))}
                  </>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Floating generate button */}
      <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 90 }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate('/plan')}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(29,158,117,0.4)', border: 'none', cursor: 'pointer',
            fontSize: 22,
          }}
          title="Plan new trip"
        >
          ✨
        </motion.button>
      </div>
    </PageWrapper>
  );
}
