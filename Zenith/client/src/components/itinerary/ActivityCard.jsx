export default function ActivityCard({ activity, index }) {
  const timeColors = {
    MORNING: { bg: '#FFF8E1', text: '#F57F17', icon: '☀️', label: 'Morning' },
    AFTERNOON: { bg: '#E8F5E9', text: '#2E7D32', icon: '🌿', label: 'Afternoon' },
    EVENING: { bg: '#EDE7F6', text: '#4527A0', icon: '🌅', label: 'Evening' },
  };
  const style = timeColors[activity.timeOfDay] || timeColors.MORNING;

  return (
    <div style={{
      padding: '16px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-neutral-200)',
      background: '#fff',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: style.bg,
          color: style.text,
          borderRadius: 'var(--radius-full)',
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {activity.emoji || style.icon} {style.label}
        </span>
      </div>

      <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--color-neutral-900)' }}>
        {activity.name}
      </h4>

      <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', lineHeight: 1.6, marginBottom: 12 }}>
        {activity.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-neutral-400)' }}>
          📍 {activity.location}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-neutral-400)' }}>
          ⏱ {activity.duration}
        </span>
        {activity.estimatedCost > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-neutral-400)' }}>
            💵 Est. ${activity.estimatedCost}
          </span>
        )}
      </div>

      {activity.tips && (
        <div style={{
          marginTop: 12,
          padding: '10px 12px',
          background: 'var(--color-primary-50)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid var(--color-primary-400)',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary-600)' }}>
            💡 Tip:
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-primary-600)', marginLeft: 4 }}>
            {activity.tips}
          </span>
        </div>
      )}
    </div>
  );
}
