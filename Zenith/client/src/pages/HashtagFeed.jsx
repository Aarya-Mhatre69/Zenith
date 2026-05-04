import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import { BackHeader } from '../components/layout/Header';
import PostCard from '../components/feed/PostCard';
import api from '../lib/api';

const RELATED_TAGS = {
  BaliAdventure: ['SunriseVibes', 'UbudLife', 'DigitalDetox', 'BaliBudget'],
  SoloJapan: ['JRPass', 'TokyoNights', 'KyotoFall', 'JapanFood'],
  BudgetGoa: ['BeachLife', 'GoaSunsets', 'BackpackerIndia'],
  '3DaysParis': ['EiffelTower', 'ParisFood', 'RomanticTravel'],
  MoroccoTrail: ['MarrakechMarket', 'Sahara', 'AtlasMountains'],
};

export default function HashtagFeed() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/posts/hashtag/${tag}`)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tag]);

  const related = RELATED_TAGS[tag] || ['Adventure', 'Travel', 'Wanderlust', 'Explore'];

  return (
    <PageWrapper>
      <BackHeader title={`#${tag}`} />

      <div style={{ padding: '16px 20px 24px' }}>
        {/* Tag header */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏷️</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', color: 'var(--color-primary-600)', marginBottom: 4 }}>
            #{tag}
          </h1>
          <p style={{ color: 'var(--color-primary-500)', fontSize: 14 }}>
            {loading ? '...' : `${posts.length} stories`}
          </p>
        </div>

        {/* Related tags */}
        <div style={{ marginBottom: 20 }}>
          <h3 className="text-h3" style={{ marginBottom: 10 }}>Related</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {related.map((t) => (
              <button
                key={t}
                className="tag"
                onClick={() => navigate(`/hashtag/${t}`)}
                style={{ cursor: 'pointer' }}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-neutral-400)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 className="text-h3" style={{ marginBottom: 8 }}>No stories yet</h3>
            <p style={{ fontSize: 14, marginBottom: 20 }}>Be the first to share a #{tag} story</p>
            <button className="btn btn-primary" onClick={() => navigate('/create')}>
              Share your story
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PostCard post={post} compact />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
