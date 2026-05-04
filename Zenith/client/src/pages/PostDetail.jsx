import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { BackHeader } from '../components/layout/Header';
import api from '../lib/api';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(setPost)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <PageWrapper>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    </PageWrapper>
  );

  if (!post) return (
    <PageWrapper>
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h3>Post not found</h3>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Go back</button>
      </div>
    </PageWrapper>
  );

  const photo = post.photos?.[0] || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&fit=crop&sig=${post.id}`;

  return (
    <PageWrapper>
      <BackHeader title={post.title} />
      <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
        <img src={photo} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          {post.author?.avatarUrl ? (
            <img src={post.author.avatarUrl} alt="" className="avatar avatar-sm" />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--color-primary-400)' }}>
              {post.author?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>@{post.author?.username}</div>
            <div className="text-caption">{post.destination} · {post.duration} days</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate(`/profile/${post.author?.username}`)}>Follow</button>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontStyle: 'italic', marginBottom: 12 }}>{post.title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-neutral-700)', marginBottom: 16 }}>{post.body}</p>
        {post.hashtags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {post.hashtags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
          </div>
        )}
        {post.itinerary && (
          <button
            className="btn btn-primary btn-full"
            onClick={() => navigate(`/itinerary/${post.itinerary.id}`)}
          >
            View Full Itinerary →
          </button>
        )}
      </div>
    </PageWrapper>
  );
}
