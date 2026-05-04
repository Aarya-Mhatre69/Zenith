import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import { MainHeader } from '../components/layout/Header';
import PostCard from '../components/feed/PostCard';
import api from '../lib/api';

const FILTERS = [
  { label: 'All', style: null },
  { label: '⛰️ Adventure', style: 'ADVENTURE' },
  { label: '🏛️ Culture', style: 'CULTURE' },
  { label: '🍜 Food', style: 'FOOD' },
  { label: '💚 Budget', budget: 'BUDGET' },
  { label: '💎 Luxury', budget: 'LUXURY' },
  { label: '🎒 Solo', companions: 'Solo' },
  { label: '💑 Couples', companions: 'Partner' },
];

const HASHTAGS = ['3DaysParis', 'BudgetGoa', 'SoloJapan', 'BaliAdventure', 'MoroccoTrail', 'KyotoFall', 'AmalfiCoast', 'BangkokFood'];

const FEATURED_PHOTOS = [
  '1493976040374-85c8e12f0c0e',
  '1537996194471-e657df975ab4',
  '1499678779905-54e0b21a94e2',
  '1570077188670-e3a8d69ac5ff',
];

function FeaturedBanner({ post, index }) {
  const navigate = useNavigate();
  const photo = post?.photos?.[0] || `https://images.unsplash.com/photo-${FEATURED_PHOTOS[index % FEATURED_PHOTOS.length]}?w=800&h=500&fit=crop`;

  return (
    <div
      style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => post ? navigate(`/post/${post.id}`) : navigate('/plan')}
    >
      <img src={photo} alt={post?.title || 'Featured'} style={{ width: '100%', height: 240, objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        {post?.author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.8)' }} />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                {post.author.username?.[0]?.toUpperCase()}
              </div>
            )}
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>@{post.author.username}</span>
          </div>
        )}
        <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>
          {post?.title || 'Discover the World Through Real Stories'}
        </h3>
        <button
          className="btn btn-accent btn-sm"
          onClick={(e) => { e.stopPropagation(); navigate('/plan'); }}
        >
          Generate Itinerary →
        </button>
      </div>
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('All');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    api.get('/posts?limit=30&filter=trending')
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeFilterObj = FILTERS.find((f) => f.label === activeFilter) || FILTERS[0];

  const filtered = posts.filter((p) => {
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.destination.toLowerCase().includes(q) && !(p.body || '').toLowerCase().includes(q)) return false;
    }
    if (activeFilterObj.style && !p.travelStyle?.includes(activeFilterObj.style)) return false;
    if (activeFilterObj.budget && p.budget !== activeFilterObj.budget) return false;
    return true;
  });

  const featured = filtered.find((p) => p.photos?.length > 0) || filtered[0];
  const gridPosts = filtered.filter((p) => p.id !== featured?.id);

  return (
    <PageWrapper>
      <MainHeader />

      {/* Search */}
      <div style={{ padding: '8px 20px 12px', position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 34, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="input input-search"
          placeholder="Search destinations, stories..."
          style={{ paddingLeft: 44 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus={!!searchParams.get('q')}
        />
      </div>

      {/* Filter chips */}
      <div className="scroll-x" style={{ padding: '0 20px 16px' }}>
        {FILTERS.map((f) => (
          <button
            key={f.label}
            className={`chip ${activeFilter === f.label ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.label)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Featured */}
        {!debouncedQuery && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="section-title" style={{ padding: 0, margin: 0 }}>Discover</h2>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-lg)' }} />
            ) : (
              <FeaturedBanner post={featured} index={0} />
            )}
          </div>
        )}

        {/* Trending hashtags */}
        {!debouncedQuery && activeFilter === 'All' && (
          <div style={{ marginBottom: 24 }}>
            <h3 className="text-h3" style={{ marginBottom: 12 }}>Trending Hashtags</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {HASHTAGS.map((tag) => (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.95 }}
                  className="tag"
                  onClick={() => navigate(`/hashtag/${tag}`)}
                  style={{ cursor: 'pointer', fontSize: 13 }}
                >
                  #{tag}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Search result label */}
        {debouncedQuery && (
          <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--color-neutral-400)' }}>
            {loading ? 'Searching...' : `${filtered.length} results for "${debouncedQuery}"`}
          </div>
        )}

        {/* Post grid */}
        <div style={{ marginBottom: 12 }}>
          {!debouncedQuery && <h3 className="text-h3" style={{ marginBottom: 14 }}>
            {activeFilter === 'All' ? 'Latest Stories' : activeFilter}
          </h3>}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card" style={{ overflow: 'hidden' }}>
                  <div className="skeleton" style={{ aspectRatio: '4/3', borderRadius: 0 }} />
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 6 }} />
                    <div className="skeleton" style={{ height: 10, width: '50%', borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : gridPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-neutral-400)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p>No stories found{debouncedQuery ? ` for "${debouncedQuery}"` : ''}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter + debouncedQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
              >
                {gridPosts.map((post) => (
                  <PostCard key={post.id} post={post} compact />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
