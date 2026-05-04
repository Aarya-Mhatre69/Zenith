import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import { BackHeader } from '../components/layout/Header';
import api from '../lib/api';

const CATEGORIES = ['Cafes', 'Restaurants', 'Markets', 'Hidden Gems', 'Viewpoints'];

const SPOTS = [
  { id: '1', name: 'The Hidden Cup', neighborhood: 'Seminyak', rating: 4.8, reviews: 234, distance: 0.3, tags: ['WifiFriendly', 'GreatVibes', 'Hidden'], photo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop', open: true, category: 'Cafes' },
  { id: '2', name: 'Sunrise Roastery', neighborhood: 'Ubud', rating: 4.6, reviews: 189, distance: 0.7, tags: ['Specialty', 'Quiet'], photo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop', open: true, category: 'Cafes' },
  { id: '3', name: 'Warung Ibu Made', neighborhood: 'Canggu', rating: 4.9, reviews: 512, distance: 1.1, tags: ['Authentic', 'Local', 'Cheap'], photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop', open: true, category: 'Restaurants' },
  { id: '4', name: 'Pasar Sindhu Night Market', neighborhood: 'Sanur', rating: 4.7, reviews: 891, distance: 3.2, tags: ['Streetfood', 'Authentic'], photo: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200&h=200&fit=crop', open: false, category: 'Markets' },
  { id: '5', name: 'Sacred Monkey Forest', neighborhood: 'Ubud', rating: 4.7, reviews: 2341, distance: 2.3, tags: ['Cultural', 'MustSee', 'Nature'], photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&h=200&fit=crop', open: true, category: 'Hidden Gems' },
  { id: '6', name: 'Mount Batur Viewpoint', neighborhood: 'Kintamani', rating: 4.9, reviews: 1204, distance: 8.5, tags: ['Sunrise', 'Volcano', 'Views'], photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop', open: true, category: 'Viewpoints' },
];

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#E24B4A' : 'none'} stroke={filled ? '#E24B4A' : 'currentColor'} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}

export default function LocalDiscovery() {
  const [activeCategory, setActiveCategory] = useState('Cafes');
  const [saved, setSaved] = useState({});
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const filtered = SPOTS.filter((s) => s.category === activeCategory);

  const toggleSave = (id) => setSaved((s) => ({ ...s, [id]: !s[id] }));

  return (
    <PageWrapper>
      <BackHeader title="Find your next quiet corner" />

      <div style={{ padding: '0 0 8px' }}>
        {/* Category chips */}
        <div className="scroll-x" style={{ padding: '12px 20px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Spots list */}
        <div style={{ padding: '0 20px' }}>
          {filtered.map((spot, i) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedSpot(spot)}
              style={{
                display: 'flex',
                gap: 14,
                padding: '14px 0',
                borderBottom: '1px solid var(--color-neutral-100)',
                cursor: 'pointer',
                alignItems: 'flex-start',
              }}
            >
              <img
                src={spot.photo}
                alt={spot.name}
                loading="lazy"
                style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700 }}>{spot.name}</h4>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(spot.id); }}
                    aria-label={saved[spot.id] ? 'Unsave' : 'Save'}
                  >
                    <HeartIcon filled={saved[spot.id]} />
                  </button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-neutral-400)', marginBottom: 6 }}>
                  {spot.neighborhood} · {spot.distance}km away
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>⭐ {spot.rating}</span>
                  <span className="text-caption">({spot.reviews} reviews)</span>
                  <span style={{ fontSize: 12, color: spot.open ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                    {spot.open ? 'Open now' : 'Closed'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {spot.tags.map((t) => (
                    <span key={t} className="tag" style={{ fontSize: 10, padding: '2px 8px' }}>#{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-neutral-400)' }}>
              No spots found in this category
            </div>
          )}
        </div>
      </div>

      {/* Detail bottom sheet */}
      {selectedSpot && (
        <>
          <div className="overlay" onClick={() => setSelectedSpot(null)} />
          <motion.div
            className="bottom-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
          >
            <div className="bottom-sheet__handle" onClick={() => setSelectedSpot(null)} style={{ cursor: 'pointer' }} />
            <div style={{ padding: '0 20px 20px' }}>
              <img src={selectedSpot.photo} alt={selectedSpot.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 16 }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 className="text-h3">{selectedSpot.name}</h3>
                <span style={{ fontSize: 12, color: selectedSpot.open ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                  {selectedSpot.open ? 'Open now' : 'Closed'}
                </span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-neutral-700)', marginBottom: 8 }}>
                📍 {selectedSpot.neighborhood} · {selectedSpot.distance}km away
              </div>
              <div style={{ fontSize: 14, marginBottom: 16 }}>
                ⭐ {selectedSpot.rating} ({selectedSpot.reviews} reviews)
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {selectedSpot.tags.map((t) => (
                  <span key={t} className="tag">#{t}</span>
                ))}
              </div>
              <button className="btn btn-accent btn-full">🧭 Get Directions</button>
            </div>
          </motion.div>
        </>
      )}
    </PageWrapper>
  );
}
