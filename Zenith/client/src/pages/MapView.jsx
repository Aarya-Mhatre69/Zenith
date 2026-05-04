import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import api from '../lib/api';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DAY_COLORS = ['#1D9E75', '#E8784A', '#7F77DD', '#F59E0B', '#3B82F6', '#EC4899', '#10B981'];

const createNumberedIcon = (n, color = '#1D9E75') => L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;background:${color};color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-family:DM Sans,sans-serif">${n}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const EXPLORE_TABS = ['All', 'Food', 'Stay', 'Activities', 'Transport'];
const BALI_CENTER = [-8.4095, 115.1889];
const EXPLORE_ROUTE = [[-8.3405, 115.0920], [-8.4095, 115.1889], [-8.5069, 115.2625], [-8.4300, 115.3317]];

const NEARBY = [
  { id: '1', name: 'Warung Ibu Made', category: 'Food', rating: 4.9, reviews: 512, distance: 1.1, open: true, photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&h=80&fit=crop', tags: ['Authentic', 'Local'] },
  { id: '2', name: 'The Hidden Cup', category: 'Food', rating: 4.8, reviews: 234, distance: 0.3, open: true, photo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=80&h=80&fit=crop', tags: ['WifiFriendly', 'Chill'] },
  { id: '3', name: 'Sacred Temple Grounds', category: 'Activities', rating: 4.7, reviews: 892, distance: 2.3, open: true, photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=80&h=80&fit=crop', tags: ['Cultural', 'MustSee'] },
  { id: '4', name: 'Sunrise Yoga Retreat', category: 'Activities', rating: 4.9, reviews: 156, distance: 0.9, open: true, photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=80&h=80&fit=crop', tags: ['Wellness'] },
  { id: '5', name: 'Villa Sari', category: 'Stay', rating: 4.8, reviews: 320, distance: 1.5, open: true, photo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=80&h=80&fit=crop', tags: ['Pool', 'Scenic'] },
];

function spreadAround(center, index, total) {
  const [lat, lng] = center;
  const angle = (index / Math.max(total, 1)) * 2 * Math.PI;
  const r = 0.025 + (index % 3) * 0.015;
  return [lat + r * Math.cos(angle), lng + r * Math.sin(angle) * 1.3];
}

async function geocodeDestination(destination) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'ZenithTravel/1.0' } }
    );
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

function FlyTo({ center, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center[0], center[1], zoom]);
  return null;
}

function LocationFinder() {
  const map = useMap();
  useEffect(() => {
    map.locate({ setView: false, enableHighAccuracy: true });
    map.on('locationfound', (e) => map.flyTo(e.latlng, 13));
  }, []);
  return null;
}

export default function MapView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const itineraryId = searchParams.get('itineraryId');
  const isRouteMode = !!itineraryId;

  const [activeTab, setActiveTab] = useState('All');
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const [itinerary, setItinerary] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [activeDay, setActiveDay] = useState(-1);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    if (!itineraryId) return;
    setLoadingRoute(true);
    setWaypoints([]);
    setItinerary(null);

    api.get(`/itineraries/${itineraryId}`)
      .then(async (data) => {
        setItinerary(data);
        const center = await geocodeDestination(data.destination);
        const fallback = center || BALI_CENTER;
        setMapCenter(fallback);

        const totalActivities = (data.days_data || []).reduce((s, d) => s + (d.activities?.length || 0), 0);
        let globalIndex = 0;
        const all = [];
        (data.days_data || []).forEach((day) => {
          (day.activities || []).forEach((act) => {
            const pos = (act.lat && act.lng)
              ? [act.lat, act.lng]
              : spreadAround(fallback, globalIndex, totalActivities);
            all.push({
              ...act,
              lat: pos[0],
              lng: pos[1],
              dayNumber: day.dayNumber,
              dayIndex: day.dayNumber - 1,
              globalIndex,
            });
            globalIndex++;
          });
        });
        setWaypoints(all);
      })
      .catch(() => {})
      .finally(() => setLoadingRoute(false));
  }, [itineraryId]);

  const filtered = NEARBY.filter((s) => activeTab === 'All' || s.category === activeTab);
  const visibleWaypoints = activeDay === -1 ? waypoints : waypoints.filter((w) => w.dayIndex === activeDay);
  const polylinePoints = visibleWaypoints.map((w) => [w.lat, w.lng]);

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter || BALI_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        {mapCenter && <FlyTo center={mapCenter} zoom={13} />}
        {!isRouteMode && <LocationFinder />}

        {/* Route mode: numbered pins per activity */}
        {isRouteMode && visibleWaypoints.map((wp) => (
          <Marker
            key={wp.id}
            position={[wp.lat, wp.lng]}
            icon={createNumberedIcon(wp.globalIndex + 1, DAY_COLORS[wp.dayIndex % DAY_COLORS.length])}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{wp.emoji} {wp.name}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>Day {wp.dayNumber} · {wp.timeOfDay}</div>
                {wp.location && <div style={{ fontSize: 11, marginTop: 3 }}>📍 {wp.location}</div>}
                {wp.duration && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>⏱ {wp.duration}</div>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route polyline */}
        {isRouteMode && polylinePoints.length > 1 && (
          <Polyline
            positions={polylinePoints}
            color="#1D9E75"
            weight={3}
            dashArray="8 6"
            opacity={0.75}
          />
        )}

        {/* Explore mode: static demo route */}
        {!isRouteMode && (
          <>
            <Polyline positions={EXPLORE_ROUTE} color="#1D9E75" weight={3} dashArray="8 6" opacity={0.8} />
            {EXPLORE_ROUTE.map((pos, i) => (
              <Marker key={i} position={pos} icon={createNumberedIcon(i + 1)}>
                <Popup>Stop {i + 1}</Popup>
              </Marker>
            ))}
          </>
        )}

        {userLocation && (
          <Circle center={userLocation} radius={30} color="#3B82F6" fillColor="#3B82F6" fillOpacity={0.3} />
        )}
      </MapContainer>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isRouteMode && (
            <button
              onClick={() => navigate(-1)}
              style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', color: 'var(--color-neutral-700)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
          )}
          <div style={{ flex: 1, position: 'relative', background: '#fff', borderRadius: 'var(--radius-full)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="input"
              style={{ paddingLeft: 44, borderRadius: 'var(--radius-full)', border: 'none', background: 'transparent' }}
              placeholder={isRouteMode ? (itinerary?.destination || 'Loading route...') : 'Search on map...'}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              readOnly={isRouteMode}
            />
          </div>
        </div>

        {/* Day filter pills for route mode */}
        {isRouteMode && itinerary?.days_data?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
            <button
              onClick={() => setActiveDay(-1)}
              style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: activeDay === -1 ? '#1D9E75' : '#fff', color: activeDay === -1 ? '#fff' : 'var(--color-neutral-700)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all 0.15s' }}
            >
              All Days
            </button>
            {itinerary.days_data.map((day, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: activeDay === i ? DAY_COLORS[i % DAY_COLORS.length] : '#fff', color: activeDay === i ? '#fff' : 'var(--color-neutral-700)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all 0.15s' }}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <motion.div
        className="bottom-sheet"
        animate={{ y: sheetExpanded ? 0 : '50%' }}
        initial={{ y: '50%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{ maxHeight: '70%', display: 'flex', flexDirection: 'column' }}
      >
        <div
          className="bottom-sheet__handle"
          onClick={() => setSheetExpanded((e) => !e)}
          style={{ cursor: 'pointer' }}
        />

        {isRouteMode ? (
          <>
            <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
              {loadingRoute ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-neutral-400)' }}>
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 13 }}>Loading route...</span>
                </div>
              ) : itinerary ? (
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{itinerary.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>
                    {waypoints.length} stops · {itinerary.days} days · {itinerary.destination}
                  </p>
                </div>
              ) : null}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
              {visibleWaypoints.map((wp) => (
                <div key={wp.id} style={{ display: 'flex', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--color-neutral-100)', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: DAY_COLORS[wp.dayIndex % DAY_COLORS.length], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {wp.globalIndex + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700 }}>{wp.emoji} {wp.name}</h4>
                      {wp.estimatedCost > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary-400)' }}>${wp.estimatedCost}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: DAY_COLORS[wp.dayIndex % DAY_COLORS.length], fontWeight: 600 }}>Day {wp.dayNumber}</span>
                      <span className="text-caption">{wp.timeOfDay}</span>
                      {wp.duration && <span className="text-caption">· {wp.duration}</span>}
                    </div>
                    {wp.location && <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>📍 {wp.location}</div>}
                  </div>
                </div>
              ))}
              {visibleWaypoints.length === 0 && !loadingRoute && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-neutral-400)' }}>
                  <div style={{ fontSize: 32 }}>📋</div>
                  <p style={{ marginTop: 8, fontSize: 13 }}>No stops for this day</p>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 16px', flexShrink: 0 }}>
              <button
                className="btn btn-accent btn-full"
                onClick={() => navigate(`/itinerary/${itineraryId}`)}
              >
                ← Back to Itinerary
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="scroll-x" style={{ padding: '0 16px 12px', flexShrink: 0 }}>
              {EXPLORE_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`chip ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ fontSize: 12, padding: '6px 14px' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
              {filtered.map((spot) => (
                <div key={spot.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-neutral-100)', alignItems: 'flex-start' }}>
                  <img src={spot.photo} alt={spot.name} style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700 }}>{spot.name}</h4>
                      <span style={{ fontSize: 11, color: spot.open ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                        {spot.open ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>⭐ {spot.rating}</span>
                      <span className="text-caption">({spot.reviews})</span>
                      <span className="text-caption">· {spot.distance}km away</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {spot.tags.map((t) => (
                        <span key={t} className="tag" style={{ fontSize: 10, padding: '2px 8px' }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 16px', flexShrink: 0 }}>
              <button className="btn btn-accent btn-full">🧭 Start Navigation</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
