import { useNavigate } from 'react-router-dom';

const DESTINATIONS = [
  { name: 'Amalfi Coast', country: 'Italy', flag: '🇮🇹', days: '5–7', photo: '1499678779905-54e0b21a94e2', color: '#1D9E75' },
  { name: 'Kyoto', country: 'Japan', flag: '🇯🇵', days: '4–6', photo: '1493976040374-85c8e12f0c0e', color: '#E8784A' },
  { name: 'Bali', country: 'Indonesia', flag: '🇮🇩', days: '7–10', photo: '1537996194471-e657df975ab4', color: '#7F77DD' },
  { name: 'Santorini', country: 'Greece', flag: '🇬🇷', days: '3–5', photo: '1570077188670-e3a8d69ac5ff', color: '#EF9F27' },
  { name: 'Marrakech', country: 'Morocco', flag: '🇲🇦', days: '4–6', photo: '1539020140153-5a0e2c1fc72e', color: '#E24B4A' },
];

export default function TrendingCard({ destination }) {
  const navigate = useNavigate();
  const data = destination || DESTINATIONS[0];
  const photo = `https://images.unsplash.com/photo-${data.photo}?w=300&h=400&fit=crop&auto=format`;

  return (
    <div
      onClick={() => navigate(`/explore?destination=${encodeURIComponent(data.name)}`)}
      style={{
        position: 'relative',
        width: 160,
        height: 210,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        flex: '0 0 160px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <img
        src={photo}
        alt={data.name}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
      }} />
      <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.2, marginBottom: 4 }}>
          {data.flag} {data.name}
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-full)',
          padding: '3px 10px',
          fontSize: 11,
          fontWeight: 600,
          color: '#fff',
        }}>
          {data.days} days
        </div>
      </div>
    </div>
  );
}

export { DESTINATIONS };
