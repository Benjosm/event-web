# Global Pulse

## Overview

**Global Pulse** is a real-time world events visualization platform that aggregates and analyzes tweets about breaking global events—such as natural disasters, protests, concerts, and sports—and presents them on an interactive heatmap using location intelligence. Unlike traditional social media feeds, Global Pulse applies natural language processing (NLP) and spatial clustering to filter noise and surface only verified, geographically relevant events.

### Why Global Pulse?

During fast-moving events—like hurricanes, protests, or major incidents—critical information is often buried in massive volumes of social media chatter. Emergency responders, journalists, and travelers need immediate situational awareness with geographic context. Global Pulse solves this problem by:

- Classifying event-type content using NLP
- Extracting and validating location data
- Clustering events spatially to reduce visual overload
- Presenting real-time insights via an intuitive, interactive map

This enables faster decision-making and resource coordination during high-stakes scenarios.

---

## Key Features

- **Real-time event ingestion** from Twitter (via mock API in MVP)
- **NLP-powered event classification** using spaCy to identify relevant content and filter noise
- **Geolocation extraction and caching** for performance-optimized lookups
- **Spatial clustering** of events to avoid marker overload on the map
- **Interactive heatmap** powered by Leaflet and React
- **Zero external dependencies** – fully containerized, easy to deploy
- **Public read access** – intended for open dissemination of non-sensitive, public-domain event data

---

## Architecture

Global Pulse follows a **monolithic backend architecture** built with **FastAPI** in Python 3.11, chosen for:

- Asynchronous I/O support for handling streaming Twitter data
- Built-in OpenAPI/Swagger documentation
- Strong typing and data validation through Pydantic and SQLModel

### Tech Stack

| Component             | Technology                                   |
|----------------------|----------------------------------------------|
| Backend Framework     | FastAPI 0.104.1                              |
| Language              | Python 3.11.9                                |
| ORM / Data Layer      | SQLModel 0.0.13 + SQLite 3.45.1 (embedded)   |
| NLP                   | spaCy 3.7.4 (`en_core_web_sm`)               |
| Frontend              | React 18 + TypeScript + Vite                 |
| Mapping               | Leaflet 1.9.4 + React-Leaflet + leaflet.heat |
| Build (Backend)       | Poetry                                         |
| Build (Frontend)      | Vite + npm                                   |
| Testing               | pytest, aioresponses, playwright (planned)   |

### File Structure

```
/usr/src/project/
├── event-backend
│   ├── pyproject.toml
│   ├── poetry.lock
│   ├── app
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── services
│   │   │   ├── __init__.py
│   │   │   ├── twitter.py
│   │   │   ├── nlp.py
│   │   │   ├── geocoding.py
│   │   │   ├── clustering.py
│   │   │   └── event_processor.py
│   │   └── api
│   │       ├── __init__.py
│   │       └── endpoints
│   │           ├── __init__.py
│   │           └── events.py
│   ├── tests
│   │   ├── __init__.py
│   │   ├── test_twitter.py
│   │   ├── test_geocoding.py
│   │   ├── test_clustering.py
│   │   └── test_events_api.py
│   └── .env.example
└── event-web
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    ├── src
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── components
    │   │   └── HeatmapMap.tsx
    │   └── services
    │       └── api.ts
    └── public
```

---

## Backend Services

### `services/twitter.py`
- Abstract base class `TwitterClient` with async `fetch_events()`
- `FakeTwitterClient` returns simulated events with:
  - Timestamp
  - Raw tweet text
  - Location string (e.g., "Paris", "Tokyo")
  - Event type (e.g., "protest", "earthquake")

### `services/geocoding.py`
- `geocode_cached(location: str)` with LRU memory cache
- Prevents repeated API calls for same locations
- Uses geopy-compatible interface (mocked for demo)

### `services/nlp.py`
- Uses spaCy pipeline to:
  - Identify event types (disaster, concert, etc.)
  - Sanitize text (remove PII, URLs, hashtags)
  - Filter out irrelevant tweets

### `services/clustering.py`
- `cluster_events(events: list[Event], radius_m: int)` groups nearby events
- Uses DBSCAN-inspired spatial clustering
- Outputs clustered coordinates with intensity weights

### `api/endpoints/events.py`
- Exposes `GET /map` returning GeoJSON `FeatureCollection`
- Integrates all services into one real-time heatmap payload

---

## Frontend Components

### `HeatmapMap.tsx`
- Uses `React-Leaflet` to render an interactive world map
- Displays clusters via `leaflet.heat` heatmap layer
- Accepts GeoJSON from backend API

### `api.ts`
- Exported function: `fetchHeatmap(): Promise<GeoJSON>`
- Connects to `/map` endpoint on FastAPI backend

---

## Security Design

- **Authentication**: None (public access only)
- **Encryption**: Not required (all data is public domain)
- **Input Validation**:
  - Pydantic models enforce schema on all API inputs
  - NLP pipeline removes potential PII from event content
  - Strict JSON parsing and rate limiting (future)
- **Verification**: Unit tests validate rejection of malformed inputs

---

## Development Setup

### Prerequisites

- Python 3.11
- Node.js 18+
- Poetry (for Python dependency management)
- npm / yarn

### Backend Setup

```bash
cd event-backend
poetry install
python -m spacy download en_core_web_sm
```

Start the server:

```bash
poetry run uvicorn app.main:app --port 8000 --reload
```

API docs available at: http://localhost:8000/docs

### Frontend Setup

```bash
cd event-web
npm install
npm run dev
```

App available at: http://localhost:5173

---

## Testing

### Backend Tests

```bash
cd event-backend
poetry run pytest
```

Verifies:
- Fake Twitter client returns ≥5 events
- Geocoding cache works with <100ms hit latency
- Clustering groups concentric events correctly
- API rejects invalid requests

### Frontend Test

```bash
cd event-web
npm run build
```

Also includes unit test for `fetchHeatmap()` with mocked response.

---

## Stubbing & Simulation

All external services are stubbed for local development:

| Service       | Stub Implementation                 | Verification                            |
|--------------|-------------------------------------|-----------------------------------------|
| Twitter API  | `FakeTwitterClient` with hardcoded events | Test checks count & schema           |
| Geocoding    | Predefined city → (lat, lon) map    | Known values tested in `test_geocoding.py` |
| Clustering   | Deterministic circular event groups | Test validates cluster density vs radius |

---

## Build & Deployment

### Build Commands

```bash
# Backend
poetry export -f requirements.txt --output requirements.txt
```

```bash
# Frontend
npm run build
# Output: ./event-web/dist/
```

### Docker (Future)
- Containerized with multi-stage build
- Lightweight Alpine base
- Static frontend served via FastAPI

---

## Verification of Completion

The project is considered **100% complete** when all of the following pass:

1. ✅ All unit tests pass:  
   ```bash
   poetry run pytest
   ```
   exits with code 0

2. ✅ Frontend builds successfully:  
   ```bash
   npm run build
   ```
   exits with code 0

3. ✅ Backend runs without error:  
   ```bash
   poetry run uvicorn app.main:app --port 8000
   ```

4. ✅ API returns valid GeoJSON:  
   ```bash
   curl http://localhost:8000/map | grep '"type":"FeatureCollection"'
   ```

5. ✅ Frontend loads and displays map:  
   ```bash
   curl http://localhost:5173 | grep 'id="map-container"'
   ```
   and contains `data-count="5"` (simulated cluster count)

6. ✅ Visual verification:  
   - Fake event locations (e.g., Paris, Tokyo, NYC) are correctly clustered
   - Heatmap renders with intensity corresponding to event density
   - Map loads without errors in browser

---

## Roadmap (Future Enhancements)

- Integrate real Twitter API / X Streaming API
- Add user authentication & role-based views
- Support alerts/notifications (email, SMS)
- Deploy to cloud with Redis cache and PostgreSQL
- Add time-slider for historical event playback
- Support multilingual NLP models

---

## License

MIT License (open source, free for public use)

---

## Contact

For contributions or inquiries, contact the project maintainer via GitHub.  
Global Pulse: Real-time awareness for a connected world. 🌍
