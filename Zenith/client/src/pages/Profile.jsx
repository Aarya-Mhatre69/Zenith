import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import ItineraryCard from '../components/itinerary/ItineraryCard';
import PostCard from '../components/feed/PostCard';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

const TIERS = [
  { name: 'Wanderer',    minXp: 0,     color: '#9AA0A6' },
  { name: 'Explorer',    minXp: 1000,  color: '#1D9E75' },
  { name: 'Adventurer',  minXp: 5000,  color: '#E8784A' },
  { name: 'Voyager',     minXp: 15000, color: '#7F77DD' },
  { name: 'Legend',      minXp: 50000, color: '#EF9F27' },
];

function getTier(xp) { return [...TIERS].reverse().find((t) => xp >= t.minXp) || TIERS[0]; }
function getNextTier(xp) { return TIERS.find((t) => t.minXp > xp); }

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const [following, setFollowing] = useState(false);

  const isMe = username === 'me' || username === currentUser?.username;
  const effectiveUsername = isMe ? currentUser?.username : username;

  useEffect(() => {
    if (!effectiveUsername) { navigate('/auth'); return; }
    setLoading(true);
    api.get(`/users/${effectiveUsername}`)
      .then((user) => {
        setProfile(user);
        return Promise.all([
          api.get(`/users/${user.id}/posts`),
          api.get(`/users/${user.id}/itineraries`),
          api.get(`/users/${user.id}/saved`),
        ]);
      })
      .then(([userPosts, userItins, userSaved]) => {
        setPosts(userPosts);
        setItineraries(userItins);
        setSaved(userSaved);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [effectiveUsername]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowing((f) => !f);
    try { await api.post(`/users/${profile.id}/follow`); }
    catch { setFollowing((f) => !f); }
  };

  const handleLogout = () => { logout(); navigate('/auth'); };

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      </PageWrapper>
    );
  }

  if (!profile) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 48 }}>👤</div>
          <h3 className="text-h3" style={{ marginTop: 16 }}>User not found</h3>
        </div>
      </PageWrapper>
    );
  }

  const tier = getTier(profile.travelScore);
  const nextTier = getNextTier(profile.travelScore);
  const progressPct = nextTier
    ? Math.min(100, ((profile.travelScore - tier.minXp) / (nextTier.minXp - tier.minXp)) * 100)
    : 100;

  const savedItins = saved.filter((s) => s.itinerary).map((s) => s.itinerary);
  const savedPosts = saved.filter((s) => s.post).map((s) => s.post);

  return (
    <PageWrapper>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <div style={{ width: 44 }} />
        <span className="text-h3">Profile</span>
        {isMe ? (
          <button className="btn-icon" onClick={handleLogout} aria-label="Sign out" style={{ color: 'var(--color-neutral-700)' }}>
            <GearIcon />
          </button>
        ) : <div style={{ width: 44 }} />}
      </header>

      {/* Profile section */}
      <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.username} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: `3px solid ${tier.color}` }} />
        ) : (
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'var(--color-primary-400)', margin: '0 auto 12px', border: `3px solid ${tier.color}` }}>
            {profile.username?.[0]?.toUpperCase()}
          </div>
        )}

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', marginBottom: 2 }}>@{profile.username}</h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: tier.color + '22', color: tier.color, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', marginBottom: 10 }}>
          {tier.name}
        </div>
        {profile.bio && <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', lineHeight: 1.5, marginBottom: 14 }}>{profile.bio}</p>}

        {/* Stats */}
        <div style={{ display: 'flex', marginBottom: 14, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
          {[
            { value: profile._count?.posts || posts.length || 0, label: 'Posts' },
            { value: profile._count?.following || 0, label: 'Following' },
            { value: profile._count?.followers || 0, label: 'Followers' },
          ].map((stat, i) => (
            <div key={stat.label} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRight: i < 2 ? '1px solid var(--color-neutral-200)' : 'none' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-neutral-900)' }}>{stat.value}</div>
              <div className="text-caption">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {!isMe ? (
          <button className={`btn btn-full ${following ? 'btn-ghost' : 'btn-primary'}`} onClick={handleFollow} style={{ marginBottom: 14 }}>
            {following ? '✓ Following' : 'Follow'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/plan')}>✨ Plan Trip</button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/trips')}>My Trips</button>
          </div>
        )}

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div className="scroll-x" style={{ marginBottom: 16, justifyContent: 'center' }}>
            {profile.badges.map((badge) => (
              <div key={badge.id} title={badge.desc} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', flexShrink: 0, cursor: 'default' }}>
                <span style={{ fontSize: 22 }}>{badge.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-neutral-700)' }}>{badge.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Travel score */}
        <div style={{ padding: '14px 16px', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: tier.color, marginBottom: 1 }}>{tier.name} Tier</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{profile.travelScore.toLocaleString()} XP</div>
            </div>
            {nextTier && (
              <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--color-neutral-400)' }}>
                <div>Next: {nextTier.name}</div>
                <div style={{ fontWeight: 700 }}>{(nextTier.minXp - profile.travelScore).toLocaleString()} XP to go</div>
              </div>
            )}
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${tier.color}, ${nextTier?.color || tier.color}88)` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--color-neutral-200)' }}>
        {['Posts', 'Itineraries', 'Saved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px 8px', fontSize: 13, fontWeight: 600,
              color: activeTab === tab ? 'var(--color-primary-400)' : 'var(--color-neutral-400)',
              borderBottom: activeTab === tab ? '2.5px solid var(--color-primary-400)' : '2.5px solid transparent',
              marginBottom: -2,
              transition: 'all 0.15s',
            }}
          >
            {tab}
            <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.7 }}>
              {tab === 'Posts' && `(${posts.length})`}
              {tab === 'Itineraries' && `(${itineraries.length})`}
              {tab === 'Saved' && `(${savedItins.length + savedPosts.length})`}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px 20px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'Posts' && (
              posts.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      style={{ aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                    >
                      <img
                        src={post.photos?.[0] || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=200&fit=crop&sig=${post.id}`}
                        alt={post.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-neutral-400)' }}>
                  <div style={{ fontSize: 48 }}>📷</div>
                  <p style={{ marginTop: 12 }}>No posts yet</p>
                  {isMe && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/create')}>Share your first story</button>}
                </div>
              )
            )}

            {activeTab === 'Itineraries' && (
              itineraries.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {itineraries.map((itin) => (
                    <ItineraryCard key={itin.id} itinerary={itin} showAuthor={false} compact />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-neutral-400)' }}>
                  <div style={{ fontSize: 48 }}>🗺️</div>
                  <p style={{ marginTop: 12 }}>No itineraries yet</p>
                  {isMe && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/plan')}>Plan a trip with AI</button>}
                </div>
              )
            )}

            {activeTab === 'Saved' && (
              savedItins.length + savedPosts.length > 0 ? (
                <div>
                  {savedItins.length > 0 && (
                    <>
                      <h3 className="text-h3" style={{ marginBottom: 12 }}>Itineraries</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                        {savedItins.map((itin) => <ItineraryCard key={itin.id} itinerary={itin} compact />)}
                      </div>
                    </>
                  )}
                  {savedPosts.length > 0 && (
                    <>
                      <h3 className="text-h3" style={{ marginBottom: 12 }}>Posts</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                        {savedPosts.map((post) => (
                          <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} style={{ aspectRatio: '1', overflow: 'hidden', cursor: 'pointer' }}>
                            <img src={post.photos?.[0] || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=200&fit=crop&sig=${post.id}`} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-neutral-400)' }}>
                  <div style={{ fontSize: 48 }}>🔖</div>
                  <p style={{ marginTop: 12 }}>Nothing saved yet</p>
                  {isMe && <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/explore')}>Browse posts</button>}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
