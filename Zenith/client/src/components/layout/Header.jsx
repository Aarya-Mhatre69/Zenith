import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}

export function MainHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="page-header">
      <button
        className="btn-icon"
        onClick={() => navigate(user ? `/profile/${user.username}` : '/auth')}
        aria-label="Profile"
        style={{ padding: 0 }}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="avatar avatar-sm"
            style={{ width: 36, height: 36 }}
          />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'var(--color-primary-400)' }}>
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </button>

      <span className="page-header__title">Zenith</span>

      <button className="btn-icon" aria-label="Notifications" style={{ color: 'var(--color-neutral-700)' }}>
        <BellIcon />
      </button>
    </header>
  );
}

export function BackHeader({ title, rightSlot }) {
  const navigate = useNavigate();

  return (
    <header className="page-header">
      <button
        className="btn-icon"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        style={{ color: 'var(--color-neutral-700)' }}
      >
        <BackIcon />
      </button>
      <span className="text-h3" style={{ flex: 1, textAlign: 'center', padding: '0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title}
      </span>
      {rightSlot || <div style={{ width: 44 }} />}
    </header>
  );
}
