import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const STORY_COLORS = [
  'linear-gradient(135deg, #1D9E75, #17856A)',
  'linear-gradient(135deg, #E8784A, #D85A30)',
  'linear-gradient(135deg, #7F77DD, #5D55C0)',
  'linear-gradient(135deg, #EF9F27, #D88B10)',
  'linear-gradient(135deg, #E24B4A, #C43535)',
  'linear-gradient(135deg, #17856A, #0F6E56)',
];

const DESTINATIONS = ['Bali', 'Kyoto', 'Paris', 'Morocco', 'Santorini', 'Bangkok'];

function StoryRing({ hasNew }) {
  return (
    <div style={{
      padding: 2,
      borderRadius: '50%',
      background: hasNew
        ? 'linear-gradient(135deg, var(--color-primary-400), var(--color-accent-400))'
        : 'var(--color-neutral-200)',
    }}>
      <div style={{ padding: 2, borderRadius: '50%', background: '#fff' }}>
        <div style={{ borderRadius: '50%', overflow: 'hidden' }}>
          {/* inner content */}
        </div>
      </div>
    </div>
  );
}

export default function StoryReel({ travelers = [] }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const mockTravelers = travelers.length > 0 ? travelers : DESTINATIONS.map((dest, i) => ({
    id: `story-${i}`,
    username: dest,
    avatarUrl: `https://images.unsplash.com/photo-${['1537996194471-e657df975ab4', '1493976040374-85c8e12f0c0e', '1499678779905-54e0b21a94e2', '1539020140153-5a0e2c1fc72e', '1570077188670-e3a8d69ac5ff', '1528360983277-13d401cdc186'][i]}?w=100&h=100&fit=crop`,
    destination: dest,
    hasNew: i < 3,
  }));

  return (
    <div style={{ paddingBottom: 4 }}>
      <div className="scroll-x" style={{ padding: '4px 20px 8px', gap: 16 }}>
        {/* Your story */}
        <motion.div
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('/create')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: user?.avatarUrl ? 'transparent' : 'var(--color-primary-50)',
              border: '2px dashed var(--color-primary-400)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 24, color: 'var(--color-primary-400)' }}>+</span>
              )}
            </div>
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 20, height: 20, borderRadius: '50%',
              background: 'var(--color-primary-400)',
              border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1,
            }}>+</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-neutral-700)', maxWidth: 60, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Your story
          </span>
        </motion.div>

        {/* Destination stories */}
        {mockTravelers.map((traveler, i) => (
          <motion.div
            key={traveler.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate(`/explore?destination=${encodeURIComponent(traveler.destination || traveler.username)}`)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              padding: 2,
              borderRadius: '50%',
              background: traveler.hasNew
                ? 'linear-gradient(135deg, var(--color-primary-400), var(--color-accent-400))'
                : 'var(--color-neutral-200)',
            }}>
              <div style={{ padding: 2, borderRadius: '50%', background: '#fff' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  overflow: 'hidden',
                  background: STORY_COLORS[i % STORY_COLORS.length],
                }}>
                  {traveler.avatarUrl ? (
                    <img src={traveler.avatarUrl} alt={traveler.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                      🌍
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-neutral-700)', maxWidth: 64, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {traveler.destination || traveler.username}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
