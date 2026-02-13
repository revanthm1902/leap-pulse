# LeapPulse — Brand Intelligence Dashboard

> Real-time brand health monitoring dashboard that aggregates social media mentions, sentiment analysis, and competitive intelligence into a single unified view.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-blue?logo=tailwindcss)
![Python](https://img.shields.io/badge/Python-3.10+-green?logo=python)

---

## Features

- **Net Sentiment Gauge** — Animated arc gauge showing overall brand sentiment (0–100)
- **7-Day Trend Chart** — Interactive area chart tracking daily sentiment movement
- **Priority Triage Feed** — Alert cards sorted by severity (Critical → High → Gold → Neutral)
- **Platform Breakdown** — Visual progress bars showing mention distribution across Reddit, Twitter/X, LinkedIn, YouTube, and Google News
- **Sentiment Distribution** — Donut chart with positive/negative/neutral split
- **Trending Topics** — Tag cloud + ranked list with trend indicators
- **Dark / Light Mode** — Smooth animated theme toggle with system preference detection
- **Mock & Live Data Modes** — Toggle between built-in demo data and real-time scraped data
- **Real-time Updates** — Supabase Realtime subscriptions for live dashboard refresh

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.9, Vite 7 |
| Styling | Tailwind CSS v4, CSS Custom Properties |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Backend | Python 3.10+, FastAPI, BeautifulSoup |
| Database | Supabase (PostgreSQL + Realtime) |
| Sentiment | TextBlob NLP |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173** — the dashboard loads instantly with mock data.  
No backend or database setup required for the demo.

### Production Build

```bash
npm run build
npm run preview
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│              React Frontend                     │
│   Vite + React 19 + Tailwind v4 + Recharts     │
│                                                 │
│   ┌────────────┐     ┌──────────────┐           │
│   │ Mock Data  │     │ Supabase     │  ← Toggle │
│   │ (built-in) │     │ Realtime     │    modes   │
│   └────────────┘     └──────┬───────┘           │
└─────────────────────────────┼───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Supabase DB     │
                    │   (PostgreSQL)    │
                    └─────────▲─────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Python Scrapers  │
                    │  (FastAPI Server) │
                    │                   │
                    │  • Reddit         │
                    │  • Twitter/X      │
                    │  • LinkedIn       │
                    │  • Google News    │
                    │  • YouTube        │
                    └───────────────────┘
```

## Project Structure

```
leappulse/
├── src/
│   ├── App.tsx                    # Main layout with data source toggle
│   ├── main.tsx                   # Entry point with ThemeProvider
│   ├── index.css                  # CSS variables, theme tokens, animations
│   ├── components/
│   │   ├── Header.tsx             # Sticky header + dark/light mode toggle
│   │   ├── HeroMetric.tsx         # Sentiment gauge + trend chart + KPIs
│   │   ├── PriorityTriage.tsx     # Priority-sorted mention cards
│   │   └── InsightsSidebar.tsx    # Pie chart + platform bars + trending topics
│   ├── hooks/
│   │   ├── useRealtimeData.ts     # Data fetching, Supabase realtime, mock fallback
│   │   └── useTheme.tsx           # Dark/light mode context + persistence
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client initialization
│   │   └── utils.ts               # cn() Tailwind merge helper
│   └── data/
│       └── mockData.ts            # Built-in demo data + TypeScript interfaces
│
├── backend/
│   ├── server.py                  # FastAPI REST server
│   ├── main.py                    # Scraper orchestrator + scheduler
│   ├── config.py                  # Environment configuration
│   ├── db.py                      # Supabase DB client
│   ├── sentiment.py               # TextBlob sentiment analysis
│   ├── aggregator.py              # Metrics computation
│   ├── seed_mock_data.py          # Seed Supabase with test data
│   ├── requirements.txt           # Python dependencies
│   ├── supabase_schema.sql        # Database schema
│   └── scrapers/                  # Platform-specific scrapers
│       ├── reddit_scraper.py
│       ├── twitter_scraper.py
│       ├── linkedin_scraper.py
│       ├── google_news_scraper.py
│       └── youtube_scraper.py
│
├── index.html
├── vite.config.ts
├── package.json
├── SETUP.md                       # Detailed setup & configuration guide
└── README.md
```

## Dark / Light Mode

The dashboard includes a theme toggle in the header (Sun/Moon icon). Themes use CSS custom properties for smooth animated transitions. The preference is saved to `localStorage` and respects `prefers-color-scheme` on first visit.

## Data Modes

| Mode | Description |
|------|------------|
| **Mock Data** (default) | Built-in demo data, no backend required. Purple toggle badge. |
| **Live Data** | Connects to FastAPI backend → Supabase. Green pulsing badge. |

Click the toggle button beneath the header to switch between modes.

## Full Setup (Live Data)

For real-time scraping with a live backend, see the detailed [SETUP.md](SETUP.md) which covers:

1. Creating a Supabase project & running the schema
2. Configuring the Python backend with environment variables
3. Running scrapers (one-time or scheduled)
4. Connecting the frontend to Supabase for real-time updates

### Quick Backend Start

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

# Start the FastAPI server
uvicorn server:app --reload --port 8000
```

Then switch to **Live Data** mode in the dashboard.

## Environment Variables

### Frontend (`.env` in project root)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public API key |

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | — |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | — |
| `BRAND_NAME` | Primary brand to monitor | `LeapScholar` |
| `COMPETITORS` | Comma-separated competitor names | `Yocket,IDP` |
| `SCRAPE_INTERVAL_MINUTES` | Scrape cycle interval | `15` |

## License

MIT

