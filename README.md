# Jaipur Municipal Disaster CAD — FastAPI Backend Service

Production-grade, asynchronous REST API for the Jaipur Emergency Dispatch, Multi-Signal Eyewitness Triage, and Tactical Resource CAD System.

---

## 🏛️ Architecture Overview

The backend is built following clean layered architecture, separation of concerns, and repository abstractions:

```
backend/
├── requirements.txt            # Python package dependencies
├── .env.example                # Environment variable names template
├── README.md                   # Local development and API documentation
├── tests/
│   └── test_api.py             # Pytest automated test suite
└── app/
    ├── __init__.py
    ├── main.py                 # FastAPI application factory, lifespan, health, error handlers
    ├── config.py               # Pydantic BaseSettings with CORS & environment validation
    ├── api/
    │   ├── __init__.py
    │   ├── deps.py             # Dependency injection providers for services & repositories
    │   └── v1/
    │       ├── __init__.py
    │       ├── router.py       # API v1 consolidated routing table
    │       └── endpoints/
    │           ├── public_reports.py     # POST /api/v1/reports
    │           ├── public_incidents.py   # GET /api/v1/incidents, GET /api/v1/incidents/{id}
    │           ├── auth.py               # POST /api/v1/auth/login
    │           ├── admin_dashboard.py    # GET /api/v1/admin/dashboard
    │           ├── admin_incidents.py    # GET, PATCH, POST /api/v1/admin/incidents/*
    │           ├── admin_reports.py      # GET /api/v1/admin/reports
    │           ├── admin_resources.py    # GET, POST, PATCH /api/v1/admin/resources/*
    │           └── admin_system.py       # GET /api/v1/admin/system-status
    ├── schemas/                # Pydantic v2 validation models
    │   ├── common.py           # APIResponse envelope, pagination, error schemas
    │   ├── report.py           # Citizen report schemas (ingestion, coords, evidence)
    │   ├── incident.py         # Public & admin incident dossiers, status updates, resource dispatch
    │   ├── resource.py         # Fleet units, boats, ambulances, shelters
    │   ├── auth.py             # Login credentials, tokens, operator profiles
    │   └── system.py           # Telemetry metrics, subsystem status matrix
    ├── services/               # Core business logic layer
    │   ├── report_service.py
    │   ├── incident_service.py
    │   ├── resource_service.py
    │   ├── system_service.py
    │   └── auth_service.py
    ├── security/               # Authentication & security policies
    │   ├── auth.py             # Bearer token validation & operator profile extraction
    │   └── cors.py             # Production-hardened CORS middleware (no wildcards in prod)
    ├── db/                     # Storage layer abstractions
    │   ├── base_repository.py  # Abstract repository interfaces (IReportRepo, IIncidentRepo, etc.)
    │   └── memory_repository.py# Thread-safe in-memory repository pre-seeded with Jaipur disaster data
    ├── models/                 # Domain entity types and enums
    │   └── enums.py            # IncidentCategory, IncidentSeverity, IncidentStatus, ResourceStatus
    └── utils/                  # Utility functions & global handlers
        ├── logger.py           # Structured logging with timestamps
        └── error_handlers.py   # Centralized exception handlers for domain, HTTP, validation & 500s
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Python 3.10+
- `pip` or virtualenv

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```

Environment Variables:
| Variable | Description | Default |
| :--- | :--- | :--- |
| `APP_NAME` | Name of the service | `Jaipur Disaster CAD API` |
| `ENVIRONMENT` | Runtime environment (`development`, `staging`, `production`) | `development` |
| `API_V1_STR` | Prefix for version 1 routes | `/api/v1` |
| `CORS_ORIGINS` | Comma-separated list or JSON array of allowed origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `LOG_LEVEL` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) | `INFO` |

### 3. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 4. Run Development Server
```bash
PYTHONPATH=. uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Interactive OpenAPI Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **ReDoc Interactive Documentation**: `http://localhost:8000/redoc`
- **Health Check Endpoint**: `http://localhost:8000/health`

### 5. Run Automated Test Suite
```bash
PYTHONPATH=. pytest backend/tests/test_api.py -v
```

---

## 📡 REST API Endpoint Reference

### System Health
- `GET /health`: Service health diagnostic probe (uptime, environment, version, internal subsystems).

### Public Citizen Endpoints
- `POST /api/v1/reports`: Ingest citizen eyewitness reports with coordinates, severity, and optional evidence attachments. Returns an ingestion receipt with a `tracking_token` (e.g. `CR-JP-89241`) and initial credibility score.
- `GET /api/v1/incidents`: Retrieve verified active disaster hazards with optional query filters (`category`, `severity`, `status`, `limit`, `offset`).
- `GET /api/v1/incidents/{id}`: Retrieve public details, impact radius, and evacuation safety guidance for an incident.

### Admin & Dispatcher Endpoints
- `POST /api/v1/auth/login`: Authenticate dispatcher credentials (`username: "dispatcher"`, `password: "password123"`).
- `GET /api/v1/admin/dashboard`: Executive CAD dashboard with live active count, critical density, fleet utilization, and triage metrics.
- `GET /api/v1/admin/incidents`: Full operational incident list sorted by AI priority score with corroboration dossiers and action audit trails.
- `GET /api/v1/admin/incidents/{id}`: Full operational dossier for a specific incident.
- `GET /api/v1/admin/reports`: Citizen report triage queue with credibility scores.
- `GET /api/v1/admin/resources`: Tactical resource inventory (ambulances, rescue boats, fire tenders, shelters) with status and coordinates.
- `POST /api/v1/admin/resources`: Register a new response unit or relief shelter.
- `PATCH /api/v1/admin/resources/{id}`: Update tactical resource status, capacity, or location.
- `PATCH /api/v1/admin/incidents/{id}/status`: Update CAD incident lifecycle state (`REPORTED` $\to$ `TRIAGED` $\to$ `VERIFIED` $\to$ `DISPATCHED` $\to$ `CONTAINED` $\to$ `RESOLVED`).
- `POST /api/v1/admin/incidents/{id}/assign`: Dispatch tactical fleet units to an incident.
- `GET /api/v1/admin/system-status`: Diagnostic health matrix of API Gateway, Geospatial Mesh, AI Fusion Engine, and Evidence Vault.

---

## 🔌 Clean Repository Swappability

The storage layer is encapsulated behind abstract interfaces in `backend/app/db/base_repository.py` (`IReportRepository`, `IIncidentRepository`, `IResourceRepository`, `IUserRepository`). 

To swap the in-memory implementation with Supabase / PostgreSQL in future phases, implement the abstract classes using the database client and inject them into `backend/app/api/deps.py` without modifying any service or controller code.
