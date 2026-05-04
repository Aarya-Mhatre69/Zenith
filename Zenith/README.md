# Zenith Travel

A full-stack social travel planning platform — share trips, plan AI-generated itineraries, and discover destinations with the community.

---

## Tech Stack

### Frontend (Web — `client/`)
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| Vite | 5.3 | Build tool & dev server |
| React Router v6 | 6.23 | Client-side routing |
| Framer Motion | 11.2 | Animations & transitions |
| Zustand | 4.5 | Global state management |
| Axios | 1.7 | HTTP client |
| Leaflet + react-leaflet | 1.9 / 4.2 | Interactive maps (OpenStreetMap, free) |
| Socket.io-client | 4.7 | Real-time updates |
| date-fns | 3.6 | Date formatting |

### Mobile (React Native — `mobile/`)
| Technology | Version | Purpose |
|---|---|---|
| Expo | 51 | Managed React Native workflow |
| React Native | 0.74 | Cross-platform mobile framework |
| React Navigation v6 | 6.x | Native navigation (stack + tabs) |
| react-native-maps | 1.14 | Native maps (Apple Maps / Google Maps) |
| expo-linear-gradient | 13 | Gradient backgrounds |
| expo-image-picker | 15 | Camera & gallery access |
| expo-location | 17 | Device GPS |
| @expo/vector-icons | 14 | Icon set (Ionicons) |
| react-native-reanimated | 3.x | Smooth native animations |
| Zustand | 4.5 | Global state (shared logic with web) |
| AsyncStorage | 1.23 | Token & data persistence |
| Axios | 1.7 | HTTP client |
| Socket.io-client | 4.7 | Real-time feed updates |

### Backend (`server/`)
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 4.19 | HTTP server & routing |
| Prisma ORM | 5.14 | Database access layer |
| PostgreSQL | 15+ | Primary database |
| Socket.io | 4.7 | WebSocket real-time server |
| JSON Web Tokens | 9.0 | Authentication |
| bcryptjs | 2.4 | Password hashing |
| Multer | 1.4 | Image upload handling |
| Helmet | 7.1 | HTTP security headers |
| CORS | 2.8 | Cross-origin request handling |

### AI & External Services (all free)
| Service | Purpose | Cost |
|---|---|---|
| Groq API (`llama-3.3-70b-versatile`) | AI itinerary generation | Free tier |
| Template Generator (built-in) | Offline fallback — no key needed | Free forever |
| OpenStreetMap / Nominatim | Map tiles + geocoding | Free & open |
| Unsplash (direct CDN) | Travel photography (hardcoded IDs) | Free |
| Neon PostgreSQL | Cloud database | Free tier |

---

## Project Structure

```
Zenith/
├── client/                     # React web app
│   └── src/
│       ├── pages/              # 14 page components
│       │   ├── Home.jsx
│       │   ├── Explore.jsx
│       │   ├── MapView.jsx
│       │   ├── Profile.jsx
│       │   ├── PlanTrip.jsx
│       │   ├── MyTrips.jsx
│       │   ├── ItineraryDetail.jsx
│       │   ├── ItineraryEdit.jsx
│       │   ├── CreatePost.jsx
│       │   ├── PostDetail.jsx
│       │   ├── HotelBooking.jsx
│       │   ├── LocalDiscovery.jsx
│       │   ├── HashtagFeed.jsx
│       │   └── Onboarding.jsx
│       ├── components/
│       │   ├── feed/           # PostCard, StoryReel
│       │   ├── itinerary/      # ItineraryCard, ActivityCard
│       │   ├── layout/         # PageWrapper, BottomNav
│       │   └── ui/             # Toast, Button
│       ├── store/              # Zustand stores
│       ├── hooks/              # useSocket, custom hooks
│       └── lib/                # api.js (axios client)
│
├── mobile/                     # Expo React Native app
│   └── src/
│       ├── screens/            # 14 screens (1-to-1 with web pages)
│       ├── components/         # Native equivalents of web components
│       ├── navigation/         # React Navigation setup
│       ├── store/              # Same Zustand stores
│       ├── hooks/              # Same hooks
│       ├── lib/                # Same api.js
│       └── theme/              # Colors, typography, spacing
│
└── server/                     # Express API
    ├── src/
    │   ├── routes/             # Auth, posts, itineraries, users, map, activities, AI
    │   ├── services/           # itinerary-generator.js, template-generator.js
    │   ├── middleware/         # authMiddleware.js
    │   └── app.js, server.js
    └── prisma/
        ├── schema.prisma       # Full data model
        └── seed.js             # 50+ posts, users, itineraries
```

---

## Database Schema

```
User          — auth, profile, travelScore, badges
Post          — title, body, photos[], destination, budget, travelStyle[], hashtags[]
Itinerary     — title, destination, days, budget, estimatedCost, isAiGenerated
ItineraryDay  — dayNumber, theme, activities[]
Activity      — timeOfDay, name, emoji, description, location, duration, estimatedCost
Like          — userId + postId
Save          — userId + (postId | itineraryId)
Follow        — followerId + followingId
Comment       — body, authorId, postId
Badge         — name, icon, desc
```

---

## Features

### Social Feed
- Infinite-scroll post feed with real-time like updates via Socket.io
- Story reel (Instagram-style destination stories)
- Hashtag feeds (`#bali`, `#solotravel`, etc.)
- Like, save, and comment on posts
- Create posts with photos, destination, budget, and travel style tags

### AI Itinerary Planner
- Multi-step form: destination → dates → budget + travel style → generate
- Powered by Groq (free tier) with `llama-3.3-70b-versatile`
- Falls back to a built-in template generator (zero API key required)
- Generates day-by-day activities with themes, emoji, tips, and cost estimates
- Clone any itinerary and customize it

### Interactive Maps
- OpenStreetMap tiles (free, no API key)
- Route mode: enter from an itinerary to see numbered activity pins
- Geocodes destinations using Nominatim API
- Day filter pills to highlight per-day routes
- Dashed polyline connecting stops in order

### Trip Management
- My Trips page: Created / Saved / AI Trips tabs
- Day-by-day itinerary editor (add/edit/delete activities and days)
- Save any itinerary from the community
- Stats: estimated total cost, days, rating, saves

### User Profiles
- Follow / following system
- Tier badges (Explorer, Adventurer, Globetrotter, Legend) based on travel score
- Tabs: Posts / Itineraries / Saved
- Avatar with tier-color border

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Neon](https://neon.tech) PostgreSQL database (or local PostgreSQL)
- Optional: Free [Groq API key](https://console.groq.com) for AI generation

### 1. Clone & Install

```bash
git clone <repo-url>
cd Zenith

# Install all workspaces
npm install
npm install --workspace=client
npm install --workspace=server
```

### 2. Configure Environment

Create `server/.env`:

```env
DATABASE_URL="postgresql://user:password@host/zenith?sslmode=require"
JWT_SECRET="your-random-secret-string"
GROQ_API_KEY="your-groq-key"          # optional
PORT=3001
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

### 3. Set Up Database

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
node src/prisma/seed.js
cd ..
```

### 4. Run (Web)

```bash
# Both server + client together
npm run dev

# Or separately
npm run dev:server    # http://localhost:3001
npm run dev:client    # http://localhost:5173
```

### 5. Run (Mobile)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android). For Android maps, add your Google Maps API key to `mobile/app.json`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/posts` | Feed (paginated, filter by recent/trending) |
| POST | `/api/posts` | Create post |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/save` | Toggle save |
| GET | `/api/itineraries` | Browse community itineraries |
| POST | `/api/itineraries` | Create itinerary |
| GET | `/api/itineraries/:id` | Get itinerary with days + activities |
| POST | `/api/itineraries/:id/clone` | Clone to your account |
| POST | `/api/itineraries/:id/save` | Toggle save |
| POST | `/api/itineraries/:id/days` | Add day |
| DELETE | `/api/itineraries/:id/days/:dayId` | Delete day |
| PUT | `/api/activities/:id` | Update activity |
| DELETE | `/api/activities/:id` | Delete activity |
| POST | `/api/activities/day/:dayId` | Add activity to day |
| POST | `/api/ai/generate` | Generate AI itinerary |
| GET | `/api/map/nearby` | Nearby spots |
| GET | `/api/map/route?itineraryId=` | Itinerary waypoints |
| GET | `/api/users/:id/itineraries` | User's itineraries |
| GET | `/api/users/:id/saved` | User's saved items |

---

## Seed Data

The seed file (`server/src/prisma/seed.js`) creates:
- **15 users** with realistic profiles, avatars, and travel scores
- **50 posts** across 20+ destinations (Bali, Tokyo, Paris, Marrakech, Santorini…)
- **10 AI-generated itineraries** with full day plans and activities
- **Follows, likes, and saves** for a realistic social graph
- **Badges** assigned based on travel score tiers

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Any random string (32+ chars for prod) |
| `GROQ_API_KEY` | No | Free at console.groq.com — app works without it |
| `PORT` | No | Server port (default 3001) |
| `CLIENT_URL` | No | CORS origin (default http://localhost:5173) |
| `NODE_ENV` | No | `development` or `production` |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server + client concurrently |
| `npm run dev:server` | Start server only |
| `npm run dev:client` | Start client only |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

Run DB scripts from the `server/` directory.

---

## License

MIT
