# LeapPulse — Setup & Configuration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  (Vite + React 19 + Tailwind v4 + Recharts)            │
│                                                         │
│   ┌──────────────┐   ┌──────────────┐                  │
│   │  Mock Data   │   │  Supabase    │   ← Toggle       │
│   │  (built-in)  │   │  Realtime    │     between      │
│   └──────────────┘   └──────┬───────┘     modes        │
│                             │                           │
└─────────────────────────────┼───────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Supabase DB     │
                    │   (PostgreSQL)    │
                    │   + Realtime      │
                    └─────────▲─────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Python Scrapers  │
                    │  (BeautifulSoup)  │
                    │                   │
                    │  • Reddit         │
                    │  • Twitter/X      │
                    │  • LinkedIn       │
                    │  • Google News    │
                    │  • YouTube        │
                    └───────────────────┘
```

---

## Quick Start (Demo / Mock Data)

If you just want to run the dashboard with **mock data** (no Supabase or Python needed):

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The dashboard will display built-in mock data.  
Click the **"Mock Data"** toggle button (top-left under header) to confirm you're in mock mode.

---

## Full Setup (Live Scraping + Supabase)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Copy your **Project URL** and **anon public key** from:  
   `Settings → API → Project URL` and `Project API keys → anon/public`.
3. Also copy the **service_role key** (for the Python backend).

### 2. Set Up the Database

1. Open the **SQL Editor** in your Supabase dashboard.
2. Paste the contents of [`backend/supabase_schema.sql`](backend/supabase_schema.sql) and run it.
3. This creates all tables, policies, indexes, and enables Realtime.

### 3. Configure the Python Backend

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download TextBlob corpora (for sentiment analysis)
python -m textblob.download_corpora
```

Create a `.env` file in the `backend/` folder:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key...
BRAND_NAME=LeapScholar
COMPETITORS=Yocket,IDP
SCRAPE_INTERVAL_MINUTES=15
```

### 4. Run the Scraper

**One-time run:**
```bash
python main.py
```

**Continuous scheduled mode (every 15 minutes):**
```bash
python main.py --schedule
```

**Seed with mock data (to test the Supabase → frontend pipeline):**
```bash
python seed_mock_data.py
```

### 5. Configure the Frontend

Create a `.env` file in the project root (`leappulse/`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-public-key...
```

Then start the dev server:

```bash
npm run dev
```

The dashboard will automatically connect to Supabase and switch to **Live Data** mode.

---

## Switching Between Live and Mock Data

The dashboard has a **toggle button** in the top-left corner under the header:

| Mode | Button Shows | What It Does |
|------|-------------|--------------|
| **Mock Data** | 🧪 Mock Data (purple dot) | Uses built-in hardcoded data. No backend needed. |
| **Live Data** | 🗄️ Live Data (green pulsing dot) | Connects to Supabase. Real-time subscriptions active. |

### For a Quick Demo

1. Start the frontend **without** `.env` variables → defaults to Mock Data mode.
2. Or click the toggle button to switch to Mock Data at any time.

### For Real-Time Production

1. Set up Supabase + Python backend (Steps 1-5 above).
2. The dashboard auto-detects Supabase credentials and switches to Live mode.
3. The toggle stays available so you can compare live vs mock data.

---

## How Real-Time Updates Work

1. **Python scrapers** run every 15 minutes (configurable).
2. Scrapers push new mentions → Supabase `social_mentions` table.
3. Aggregator computes metrics → pushes to `dashboard_metrics`, `share_of_voice`, etc.
4. **Supabase Realtime** sends PostgreSQL change events to the frontend.
5. The React `useRealtimeData` hook receives these events and **auto-updates** all components.

No manual refresh needed — the dashboard updates live when new data arrives.

---

## Project Structure

```
leappulse/
├── src/
│   ├── App.tsx                  # Main layout with data source toggle
│   ├── components/
│   │   ├── Header.tsx           # Sticky header
│   │   ├── HeroMetric.tsx       # Gauge + trend chart + KPIs
│   │   ├── PriorityTriage.tsx   # Alert feed sorted by priority
│   │   └── InsightsSidebar.tsx  # Share of Voice + Trending Topics
│   ├── hooks/
│   │   └── useRealtimeData.ts   # Supabase realtime hook + mock fallback
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client init
│   │   └── utils.ts             # cn() helper
│   └── data/
│       └── mockData.ts          # Built-in mock data + TypeScript interfaces
│
├── backend/
│   ├── main.py                  # Orchestrator + scheduler
│   ├── config.py                # Environment config
│   ├── db.py                    # Supabase DB client
│   ├── sentiment.py             # Sentiment analysis (TextBlob)
│   ├── aggregator.py            # Metrics computation
│   ├── seed_mock_data.py        # Seeds Supabase with mock data
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment template
│   ├── supabase_schema.sql      # Full database schema
│   └── scrapers/
│       ├── reddit_scraper.py    # Reddit (public JSON API)
│       ├── twitter_scraper.py   # Twitter/X (via Nitter instances)
│       ├── linkedin_scraper.py  # LinkedIn (via Google search)
│       ├── google_news_scraper.py  # Google News (RSS feed)
│       └── youtube_scraper.py   # YouTube (HTML parsing)
│
├── .env                         # Frontend env vars (create this)
├── SETUP.md                     # ← You are here
└── package.json
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard shows no live data | Run `python seed_mock_data.py` to seed Supabase, or run `python main.py` to scrape |
| "Supabase not configured" | Check that `.env` has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Scrapers return no results | Some platforms may block requests — try again later or adjust `HEADERS` in `config.py` |
| Nitter instances down | Twitter scraper falls back gracefully; update `NITTER_INSTANCES` in `twitter_scraper.py` |
| `TextBlob` error | Run `python -m textblob.download_corpora` |

---

## Environment Variables Reference

### Frontend (`.env` in project root)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | — |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key | — |
| `BRAND_NAME` | Primary brand to track | `LeapScholar` |
| `COMPETITORS` | Comma-separated competitor names | `Yocket,IDP` |
| `SCRAPE_INTERVAL_MINUTES` | Minutes between scrape cycles | `15` |
