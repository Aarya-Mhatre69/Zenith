import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

function HeartIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#E24B4A' : 'none'} stroke={filled ? '#E24B4A' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'var(--color-primary-400)' : 'none'} stroke={filled ? 'var(--color-primary-400)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
    </svg>
  );
}

export default function PostCard({ post, compact = false }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [saved, setSaved] = useState(post.saved || false);
  const [liking, setLiking] = useState(false);

  const photo = post.photos?.[0] || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80&sig=${post.id}`;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch {
      setLiked(!newLiked);
      setLikeCount((c) => c + (newLiked ? -1 : 1));
    } finally {
      setLiking(false);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    setSaved((s) => !s);
    try {
      await api.post(`/posts/${post.id}/save`);
    } catch {
      setSaved((s) => !s);
    }
  };

  if (compact) {
    return (
      <div
        className="card card-hover"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/post/${post.id}`)}
      >
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
          <img
            src={photo}
            alt={post.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={handleSave}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label={saved ? 'Unsave' : 'Save'}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>
        <div style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {post.author?.avatarUrl ? (
              <img src={post.author.avatarUrl} alt="" className="avatar" style={{ width: 24, height: 24 }} />
            ) : (
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'var(--color-primary-400)' }}>
                {post.author?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-caption" style={{ color: 'var(--color-neutral-700)' }}>@{post.author?.username}</span>
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: liked ? '#E24B4A' : 'var(--color-neutral-400)', transition: 'color 0.15s' }}>
              <HeartIcon filled={liked} />
              <span>{likeCount}</span>
            </button>
            {post.destination && <span className="tag" style={{ fontSize: 10, padding: '2px 8px' }}>{post.destination}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', marginBottom: 16 }}
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img
          src={photo}
          alt={post.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {post.destination && (
          <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--color-neutral-900)', fontSize: 12 }}>
              📍 {post.destination}
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {post.author?.avatarUrl ? (
            <img src={post.author.avatarUrl} alt="" className="avatar avatar-sm" />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--color-primary-400)' }}>
              {post.author?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>@{post.author?.username}</div>
            <div className="text-caption">{post.duration} days · {post.budget?.replace('_', ' ').toLowerCase()}</div>
          </div>
        </div>
        <h3 className="text-h3" style={{ marginBottom: 8, fontSize: 16 }}>{post.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.body}
        </p>
        {post.hashtags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {post.hashtags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag" style={{ fontSize: 11 }}>#{tag}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-neutral-100)' }}>
          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: liked ? '#E24B4A' : 'var(--color-neutral-400)', transition: 'color 0.15s' }}>
            <HeartIcon filled={liked} />
            <span>{likeCount} likes</span>
          </button>
          {post.itineraryId && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${post.itineraryId}`); }}
              className="btn btn-primary btn-sm"
            >
              View Itinerary →
            </button>
          )}
          <button onClick={handleSave} style={{ color: saved ? 'var(--color-primary-400)' : 'var(--color-neutral-400)', transition: 'color 0.15s' }} aria-label={saved ? 'Unsave' : 'Save'}>
            <BookmarkIcon filled={saved} />
          </button>
        </div>
      </div>
    </div>
  );
}
