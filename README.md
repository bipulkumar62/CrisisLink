# CrisisLink

> **Emergency Intelligence & Response Coordination Platform**  
> *Target Prototype Region: Jaipur, Rajasthan, India*

---

## 🚨 Overview

**CrisisLink** is a production-style emergency management and multi-signal CAD (Computer-Aided Dispatch) platform. It bridges the gap between eyewitness citizen reporting and real-time emergency response command centers.

By integrating real-time telemetry, structured multi-signal corroboration, AI-assisted incident extraction (via Google Gemini), and dynamic resource matching, CrisisLink enables dispatch operators to make data-backed operational decisions during urban disasters and critical emergencies.

---

## 🎯 Problem Statement

During major emergencies (e.g. urban flash floods, structural fires, highway collisions):
1. **Report Overload & Noise**: Emergency 911/112 dispatch channels get flooded with hundreds of uncoordinated call-ins describing the same event.
2. **Delayed Response**: Dispatchers manually cross-reference locations, resulting in lost minutes when allocating ambulances, rescue boats, or fire units.
3. **Lack of Ground Telemetry**: Public citizens lack real-time safety advisories and verified incident boundaries.

**CrisisLink solves this** by clustering incoming citizen eyewitness reports into canonical incidents, auto-scoring severity based on life-threat risk, providing AI-assisted evidence summaries, and maintaining real-time resource availability.

---

## 🏗️ System Architecture

```
                  ┌─────────────────────────────────────────────────────────────┐
                  │                 Public Citizen Portal                       │
                  │        (Mobile-First Reporting / Incident Feed)              │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
                                                 │ HTTPS / WebSockets
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   React + Vite Frontend                                     │
│                            (Deployed on Netlify Static Hosting)                             │
└──────────────────────┬───────────────────────────────────────────────┬──────────────────────┘
                       │                                               │
        Supabase Client│                                  REST API     │ FastAPI Router
        (Anon Key /    │                                               │ (Service Role)
        RLS Protected) │                                               ▼
                       │                             ┌───────────────────────────────────┐
                       │                             │     Python + FastAPI Backend      │
                       │                             │    (Deployed on Render API)       │
                       │                             └─────────────────┬─────────────────┘
                       │                                               │
                       │                                               │ Server-side
                       ▼                                               ▼
┌──────────────────────────────────────────────┐              ┌──────────────────┐
│           Supabase Cloud Services            │              │   Google Gemini  │
│  - PostgreSQL Database (RLS Enforced)        │              │  AI Studio API   │
│  - Realtime WebSocket Postgres Subscriptions │              │  (Structured     │
│  - Private Storage Bucket (Evidence Vault)   │              │   Extraction)    │
└──────────────────────────────────────────────┘              └──────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS v4, Lucide Icons, Framer Motion |
| **Frontend Hosting** | Netlify (`netlify.toml` SPA redirects) |
| **Backend Framework** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| **Backend Hosting** | Render Web Service (`render.yaml`) |
| **Database & Realtime** | Supabase PostgreSQL, Supabase Realtime Channels (`postgres_changes`) |
| **Database Security** | Row-Level Security (RLS) Policies |
| **AI Subsystem** | Google Gemini API (`@google/genai` / backend server-side integration) |
| **Mapping Engine** | MapLibre GL JS + OpenFreeMap Positron vector tiles (no API key required, Jaipur municipality bounds) |

---

## 📱 Platform Features

### 1. Public Citizen Portal (Mobile-First)
* **Eyewitness Emergency Reporting**: Simple, high-accessibility report submission with category tags (`FLOOD`, `FIRE`, `STRUCTURE_COLLAPSE`, `POWER_OUTAGE`, `TRAFFIC`, `OTHER`).
* **Evidence Upload**: Photo selection with type validation and size checks.
* **Geolocation Capture**: Automatic browser GPS acquisition fallback to manual Jaipur city map picking (`26.9124° N, 75.7873° E`).
* **Voice Input Fallback**: Speech-to-text integration using browser SpeechRecognition when supported.
* **Public Incident Map & Feed**: Verified incident summaries, status badges, and official safety warnings for nearby residents.

### 2. Protected Command Center (Desktop-Dense CAD)
* **Real-time Tactical Dashboard**: Live metrics tracking Critical/High incidents, active emergency units, and resolved cases.
* **Jaipur Tactical Grid Map**: MapLibre GL vector map (OpenFreeMap Positron basemap) displaying incident clusters, hazard cordons, evacuation radii, and active response vehicle locations — centered on Jaipur (26.9124° N, 75.7873° E).
* **Deterministic Severity Engine**: Automated scoring (+40 life-threat, +25 visible fire, +15 road blockages, +15 report velocity) mapping to `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` tiers.
* **AI Incident Analysis**: Server-side Gemini evaluation extracting structured indicators (`road_blocked`, `visible_fire`, `trapped_vehicle`) — explicitly labeled as *AI-assisted observations (human confirmation recommended)*.
* **Resource Matching & Dispatch**: Interactive fleet assignment for Ambulances (`EMS`), Rescue Teams (`SDRF`), Fire Engines (`FE`), Police Patrols (`PD`), and Community Shelters.
* **Audit & Event Timeline**: Immutable event trail recording status transitions (`REPORTED` → `CORROBORATED` → `ON_SCENE` → `RESOLVED`).

---

## 🔒 Security & Privacy Practices

* **Zero Frontend Secrets**: No Supabase `service_role` key, Gemini API key, or JWT secrets are embedded in frontend bundles.
* **Row-Level Security (RLS)**: Public users have insert-only or token-scoped read permissions; full modifications require authenticated server roles.
* **Server-Side AI Proxy**: Gemini API is queried exclusively from the FastAPI backend.
* **Strict CORS Controls**: Non-wildcard origin policies enforced on backend endpoints.
* **Data Sanitization**: Public incident feeds strip private victim identities and precise personal contact information.

---

## ⚙️ Environment Variables Reference

Copy `.env.example` to create your local `.env` configuration.

### Frontend Environment Variables (`.env`)
```ini
# Supabase Public API (Governed by RLS)
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Feature Flags
VITE_FORCE_MOCK=false

# Render Backend Base URL (optional for backend API integration)
VITE_API_BASE_URL=https://<your-render-app>.onrender.com
```

### Backend Environment Variables (`backend/.env`)
```ini
APP_NAME=CrisisLink CAD API
ENVIRONMENT=production
API_V1_STR=/api/v1
LOG_LEVEL=INFO
SECRET_KEY=<your-secure-random-jwt-secret>
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://<your-netlify-app>.netlify.app,http://localhost:3000

# Supabase Server Key (Service Role - Never expose to client)
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_KEY=<your-supabase-service-role-key>

# Gemini AI Key
GEMINI_API_KEY=<your-gemini-api-key>
```

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: v18.x or higher
* **Python**: v3.11 or higher
* **Git**

### 1. Clone & Install Frontend
```bash
git clone https://github.com/bipulkumar62/CrisisLink.git
cd CrisisLink

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend will launch at `http://localhost:3000`.

### 2. Set Up & Run Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/auto/activate

# Install backend dependencies
pip install -r requirements.txt

# Run FastAPI dev server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
The backend API docs will be available at `http://localhost:8000/docs`.

---

## 🗄️ Database Setup (Supabase)

1. Create a project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository.
4. Copy and paste the entire script into the SQL Editor and click **Run**.

This initializes:
* `incidents`, `resources`, `citizen_reports` tables
* Realtime PostgreSQL change notifications (`supabase_realtime` publication)
* Row-Level Security (RLS) policies
* Seed prototype data for Jaipur municipality

---

## 🌐 Deployment

### Deploy Frontend to Netlify
1. Connect your repository to **Netlify**.
2. Netlify will auto-detect settings from `netlify.toml`:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
3. Configure Netlify Environment Variables:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
   * `VITE_API_BASE_URL`

### Deploy Backend to Render
1. Create a **Web Service** on **Render** linked to your repository.
2. Render will auto-detect `render.yaml`:
   * **Runtime**: Python
   * **Build Command**: `pip install -r backend/requirements.txt`
   * **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
3. Configure Render Environment Variables:
   * `SUPABASE_URL`
   * `SUPABASE_KEY`
   * `GEMINI_API_KEY`
   * `CORS_ORIGINS`

---

## ⚠️ Prototype Simulation Disclaimer

> **PROTOTYPE SIMULATION NOTICE — JAIPUR, RAJASTHAN**  
> All incident logs, resource unit callsigns, telemetry signals, and emergency reports within this application are generated for technical demonstration and operational prototyping purposes. This software does not represent official municipal government emergency response dispatch systems.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
