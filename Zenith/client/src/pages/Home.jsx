import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import { MainHeader } from '../components/layout/Header';
import PostCard from '../components/feed/PostCard';
import StoryReel from '../components/feed/StoryReel';
import TrendingCard, { DESTINATIONS } from '../components/feed/TrendingCard';
import useFeedStore from '../store/feedStore';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../components/ui/Toast';

function SearchBar() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '8px 20px 12px', position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="input input-search"
          placeholder="Search destinations, stories..."
          style={{ paddingLeft: 44 }}
          onFocus={() => navigate('/explore')}
          readOnly
        />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
          <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
        </div>
        <div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '65%', borderRadius: 6 }} />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card" style={{ overflow: 'hidden' }}>
          <div className="skeleton" style={{ aspectRatio: '4/3', borderRadius: 0 }} />
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 10, width: '80%', borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { posts, loading, hasMore, fetchPosts, updatePostLike } = useFeedStore();
  const navigate = useNavigate();
  const toast = useToast();
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => { fetchPosts(true); }, []);

  // Infinite scroll sentinel
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading && hasMore) fetchPosts(); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore]);

  // Real-time socket events
  useSocket({
    'post:liked': ({ postId, likeCount }) => {
      updatePostLike(postId, false, likeCount);
    },
    'feed:new_post': () => {
      toast('✨ New story just posted!', 'info');
    },
    'notification': ({ message }) => {
      toast(message, 'save');
    },
  });

  const topPosts = posts.slice(0, 4);
  const morePosts = posts.slice(4);

  return (
    <PageWrapper>
      <MainHeader />
      <SearchBar />

      {/* Story reel */}
      <StoryReel />

      {/* Trending Destinations */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 12 }}>
          <h2 className="section-title" style={{ padding: 0, margin: 0 }}>Trending</h2>
          <button onClick={() => navigate('/explore')} style={{ fontSize: 13, color: 'var(--color-primary-400)', fontWeight: 600 }}>
            See all →
          </button>
        </div>
        <div className="scroll-x" style={{ padding: '0 20px 8px' }}>
          {DESTINATIONS.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <TrendingCard destination={dest} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Plan CTA */}
      <div style={{ padding: '0 20px 24px' }}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/plan')}
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(29,158,117,0.25)',
          }}
        >
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 3 }}>✨ AI Trip Planner</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Generate your perfect itinerary — free</div>
          </div>
          <div style={{ color: '#fff', fontSize: 28, lineHeight: 1 }}>→</div>
        </motion.div>
      </div>

      {/* For You Feed */}
      <section style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="section-title" style={{ padding: 0, margin: 0 }}>For You</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {['recent', 'trending'].map((f) => {
              const active = useFeedStore.getState().filter === f;
              return (
                <button
                  key={f}
                  onClick={() => useFeedStore.getState().setFilter(f)}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: active ? 'var(--color-primary-400)' : 'var(--color-neutral-100)',
                    color: active ? '#fff' : 'var(--color-neutral-700)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {loading && posts.length === 0 ? (
          <>
            <SkeletonGrid />
            <div style={{ marginTop: 16 }}>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-neutral-400)' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🗺️</div>
            <h3 className="text-h3" style={{ marginBottom: 8, color: 'var(--color-neutral-700)' }}>Discover destinations</h3>
            <p style={{ fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Follow travelers to see their stories here, or explore our community posts
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/explore')}>
              Explore Posts
            </button>
          </div>
        ) : (
          <>
            {/* 2-column grid for first 4 */}
            {topPosts.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {topPosts.map((post) => (
                  <PostCard key={post.id} post={post} compact />
                ))}
              </div>
            )}

            {/* Full-width cards for the rest */}
            {morePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: 1 }} />

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                <div className="spinner" />
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-neutral-400)', fontSize: 13 }}>
                You've seen it all — go make your own story ✈️
              </div>
            )}
          </>
        )}
      </section>
    </PageWrapper>
  );
}
