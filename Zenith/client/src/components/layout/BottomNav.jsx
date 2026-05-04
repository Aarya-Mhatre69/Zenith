import { useNavigate, useLocation } from 'react-router-dom';

const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    <path d="M3 12L12 3l9 9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" fill={filled ? 'currentColor' : 'none'}/>
    <rect x="3" y="12" width="18" height="9" rx="1" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'}/>
    <path d="M3 12l9-9 9 9v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9z" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const ExploreIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const MapIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/>
    <line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);

const ProfileIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TABS = [
  { path: '/', icon: HomeIcon, label: 'Home' },
  { path: '/explore', icon: ExploreIcon, label: 'Explore' },
  { path: '/create', icon: null, label: 'Create', isCreate: true },
  { path: '/map', icon: MapIcon, label: 'Map' },
  { path: '/profile/me', icon: ProfileIcon, label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {TABS.map((tab) => {
        const active = isActive(tab.path);
        if (tab.isCreate) {
          return (
            <button
              key={tab.path}
              className="nav-item nav-item--create"
              onClick={() => navigate('/create')}
              aria-label="Create post"
            >
              <PlusIcon />
            </button>
          );
        }
        return (
          <button
            key={tab.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <tab.icon filled={active} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
