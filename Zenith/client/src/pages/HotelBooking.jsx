import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { BackHeader } from '../components/layout/Header';

const ROOMS = [
  { id: '1', name: 'Naga Calm', price: 120, photo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop', amenities: ['King Bed', 'Ocean View', 'AC', 'Breakfast'] },
  { id: '2', name: 'Yoga Suite', price: 180, photo: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop', amenities: ['Private Pool', 'Yoga Deck', 'Jacuzzi', 'Breakfast'] },
  { id: '3', name: 'The Sunlit Brow', price: 250, photo: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=200&fit=crop', amenities: ['Villa', 'Private Garden', 'Butler', 'All-inclusive'] },
];

export default function HotelBooking() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);
  const [booking, setBooking] = useState(false);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 3;

  const subtotal = selectedRoom.price * Math.max(nights, 1);
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  return (
    <PageWrapper>
      <BackHeader title="Booking" />

      <div style={{ padding: '20px' }}>
        {/* Featured stay */}
        <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=400&fit=crop"
            alt="The Serene Sanctuary"
            style={{ width: '100%', height: 200, objectFit: 'cover' }}
          />
          <div style={{ padding: '16px' }}>
            <h2 className="text-h2" style={{ marginBottom: 4 }}>The Serene Sanctuary</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="tag">📍 Ubud, Bali</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>⭐ 4.9</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-700)' }}>
              An intimate hillside retreat surrounded by rice paddies and jungle. 12 villas, yoga shalas, and a spa.
            </p>
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Check-in</label>
            <input className="input" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Check-out</label>
            <input className="input" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
        </div>

        {/* Guests */}
        <div style={{ padding: '16px', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
          <h3 className="text-h3" style={{ marginBottom: 14 }}>Guests</h3>
          {[
            { label: 'Adults', sub: 'Ages 13+', value: adults, set: setAdults, min: 1 },
            { label: 'Children', sub: 'Ages 0–12', value: children, set: setChildren, min: 0 },
          ].map(({ label, sub, value, set, min }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                <div className="text-caption">{sub}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => set((v) => Math.max(min, v - 1))}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}
                >−</button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{value}</span>
                <button
                  onClick={() => set((v) => v + 1)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-400)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#fff' }}
                >+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Room type */}
        <h3 className="text-h3" style={{ marginBottom: 14 }}>Choose your room</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {ROOMS.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              style={{
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${selectedRoom.id === room.id ? 'var(--color-primary-400)' : 'var(--color-neutral-200)'}`,
                overflow: 'hidden',
                cursor: 'pointer',
                background: selectedRoom.id === room.id ? 'var(--color-primary-50)' : '#fff',
                transition: 'all 0.15s',
              }}
            >
              <img src={room.photo} alt={room.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700 }}>{room.name}</h4>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary-400)' }}>${room.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-neutral-400)' }}>/night</span></span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {room.amenities.map((a) => <span key={a} className="tag tag-neutral" style={{ fontSize: 11 }}>{a}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price summary */}
        <div style={{ padding: '16px', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
          <h3 className="text-h3" style={{ marginBottom: 14 }}>Price summary</h3>
          {[
            { label: `${selectedRoom.name} × ${Math.max(nights, 1)} nights`, value: `$${subtotal}` },
            { label: 'Taxes & fees (12%)', value: `$${taxes}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-neutral-200)', fontSize: 14 }}>
              <span style={{ color: 'var(--color-neutral-700)' }}>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontSize: 16, fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary-400)' }}>${total}</span>
          </div>
        </div>

        <button
          className="btn btn-accent btn-full"
          onClick={() => { setBooking(true); setTimeout(() => { setBooking(false); navigate(-1); }, 1500); }}
          disabled={booking}
        >
          {booking ? '✓ Reserved!' : 'Reserve Now →'}
        </button>
      </div>
    </PageWrapper>
  );
}
