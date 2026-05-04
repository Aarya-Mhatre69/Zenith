import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DEST_PHOTOS = {
  bali:        '1537996194471-e657df975ab4',
  kyoto:       '1493976040374-85c8e12f0c0e',
  paris:       '1499678779905-54e0b21a94e2',
  marrakech:   '1539020140153-5a0e2c1fc72e',
  santorini:   '1570077188670-e3a8d69ac5ff',
  bangkok:     '1528360983277-13d401cdc186',
  tokyo:       '1542051841857-5f90071e7483',
  'amalfi coast': '1499678779905-54e0b21a94e2',
  vietnam:     '1540575467537-786dd4da2f1f',
  morocco:     '1539020140153-5a0e2c1fc72e',
};

function getPhoto(destination, id) {
  const key = destination?.toLowerCase();
  const photoId = Object.entries(DEST_PHOTOS).find(([k]) => key?.includes(k))?.[1]
    || '1476514525535-07fb3b4ae5f1';
  return `https://images.unsplash.com/photo-${photoId}?w=600&h=400&fit=crop&auto=format&sig=${id}`;
}

const BUDGET_LABELS = {
  BACKPACKER: { label: 'Backpacker', color: '#9AA0A6' },
  BUDGET:     { label: 'Budget',     color: '#1D9E75' },
  MID_RANGE:  { label: 'Mid-range',  color: '#E8784A' },
  LUXURY:     { label: 'Luxury',     color: '#7F77DD' },
};

export default function ItineraryCard({ itinerary, showAuthor = true, compact = false }) {
  const navigate = useNavigate();
  const photo = getPhoto(itinerary.destination, itinerary.id);
  const budget = BUDGET_LABELS[itinerary.budget] || BUDGET_LABELS.MID_RANGE;

  if (compact) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="card card-hover"
        onClick={() => navigate(`/itinerary/${itinerary.id}`)}
        style={{ cursor: 'pointer', overflow: 'hidden' }}
      >
        <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
          <img src={photo} alt={itinerary.destination} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
          {itinerary.isAiGenerated && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(29,158,117,0.9)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(4px)' }}>
              ✨ AI
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.2, marginBottom: 3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {itinerary.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>📍 {itinerary.destination}</div>
          </div>
        </div>
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>🗓 {itinerary.days}d</span>
            {itinerary.estimatedCost && <span style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>${itinerary.estimatedCost.toLocaleString()}</span>}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: budget.color }}>{budget.label}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="card card-hover"
      onClick={() => navigate(`/itinerary/${itinerary.id}`)}
      style={{ cursor: 'pointer', overflow: 'hidden', marginBottom: 14 }}
    >
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <img src={photo} alt={itinerary.destination} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
        {itinerary.isAiGenerated && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(29,158,117,0.9)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(4px)' }}>
            ✨ AI Generated
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 4 }}>📍 {itinerary.destination}</div>
          <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {itinerary.title}
          </h3>
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        {showAuthor && itinerary.author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            {itinerary.author.avatarUrl ? (
              <img src={itinerary.author.avatarUrl} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-primary-400)' }}>
                {itinerary.author.username?.[0]?.toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>@{itinerary.author.username}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {[
            { icon: '🗓', value: `${itinerary.days} days` },
            { icon: '💵', value: itinerary.estimatedCost ? `$${itinerary.estimatedCost.toLocaleString()}` : '—' },
            { icon: '⭐', value: itinerary.rating?.toFixed(1) || '4.8' },
            { icon: '🔖', value: `${itinerary._count?.saves ?? itinerary.saveCount ?? 0}` },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px 0', borderRight: i < 3 ? '1px solid var(--color-neutral-100)' : 'none' }}>
              <div style={{ fontSize: 15 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: 'var(--color-neutral-700)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
