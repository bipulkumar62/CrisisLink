import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "uptime_seconds" in data
    assert data["checks"]["in_memory_cad_database"] == "connected"


def test_public_submit_report():
    payload = {
        "category": "FLOOD",
        "severity": "HIGH",
        "description": "Rising water level near Mansarovar Metro Station pillar 42. Road blocked.",
        "latitude": 26.8780,
        "longitude": 75.7650,
        "address": "Mansarovar Metro Pillar 42, Jaipur",
        "neighborhood": "Sector 4",
        "is_anonymous": False,
        "reporter_name": "Pooja Sharma",
        "reporter_phone": "+91 98290 55432",
        "people_at_risk_count": 8,
        "evidence_files": [
            {
                "name": "water_depth.jpg",
                "type": "PHOTO",
                "size_bytes": 1024000
            }
        ]
    }
    response = client.post("/api/v1/reports", json=payload)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    assert "tracking_token" in res_data["data"]
    assert res_data["data"]["tracking_token"].startswith("CR-JP-")
    assert res_data["data"]["credibility_score"] >= 70


def test_public_submit_report_validation_failure():
    # Short description should fail validation
    payload = {
        "category": "FLOOD",
        "severity": "HIGH",
        "description": "short",
        "latitude": 26.8780,
        "longitude": 75.7650,
        "address": "Mansarovar",
    }
    response = client.post("/api/v1/reports", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_public_list_incidents():
    response = client.get("/api/v1/incidents")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1
    first = data["data"][0]
    assert "code" in first
    assert "category" in first
    assert "safe_zone_guidance" in first


def test_public_get_incident_by_id():
    response = client.get("/api/v1/incidents/inc-jaipur-01")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["code"] == "INC-2026-JP-001"


def test_public_get_incident_not_found():
    response = client.get("/api/v1/incidents/non-existent-id")
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"


def test_auth_login():
    payload = {
        "username": "dispatcher",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["role"] == "DISPATCHER"


def test_auth_login_invalid_password():
    payload = {
        "username": "dispatcher",
        "password": "wrong_password"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "UNAUTHORIZED"


def test_admin_dashboard():
    response = client.get("/api/v1/admin/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["active_incidents"] >= 1
    assert "available_fleet_units" in data["data"]


def test_admin_list_incidents():
    response = client.get("/api/v1/admin/incidents")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1
    first = data["data"][0]
    assert "ai_priority_score" in first
    assert "ai_observation_summary" in first
    assert "action_logs" in first


def test_admin_get_incident_detail():
    response = client.get("/api/v1/admin/incidents/inc-jaipur-01")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == "inc-jaipur-01"


def test_admin_list_reports():
    response = client.get("/api/v1/admin/reports")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


def test_admin_list_resources():
    response = client.get("/api/v1/admin/resources")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 3


def test_admin_create_and_update_resource():
    # 1. Create
    new_res = {
        "name": "Civil Defense Quick Response Drone 03",
        "callsign": "DRONE-QD-03",
        "type": "DRONE_SURVEILLANCE",
        "latitude": 26.9120,
        "longitude": 75.7870,
        "address": "Police Control Room Heli-pad",
        "crew_count": 2,
        "battery_level_percent": 100
    }
    create_resp = client.post("/api/v1/admin/resources", json=new_res)
    assert create_resp.status_code == 201
    created_data = create_resp.json()["data"]
    res_id = created_data["id"]
    assert created_data["callsign"] == "DRONE-QD-03"

    # 2. Patch
    patch_resp = client.patch(
        f"/api/v1/admin/resources/{res_id}",
        json={"status": "BUSY", "battery_level_percent": 88}
    )
    assert patch_resp.status_code == 200
    updated_data = patch_resp.json()["data"]
    assert updated_data["status"] == "BUSY"
    assert updated_data["battery_level_percent"] == 88


def test_admin_update_incident_status():
    patch_resp = client.patch(
        "/api/v1/admin/incidents/inc-jaipur-02/status",
        json={"status": "CONTAINED", "notes": "Perimeter stabilized by JVVNL squad"}
    )
    assert patch_resp.status_code == 200
    data = patch_resp.json()
    assert data["success"] is True
    assert data["data"]["status"] == "CONTAINED"


def test_admin_assign_resources_to_incident():
    assign_resp = client.post(
        "/api/v1/admin/incidents/inc-jaipur-02/assign",
        json={
            "resource_ids": ["res-fire-01"],
            "dispatch_notes": "Deploy tender for structural washdown and barrier support."
        }
    )
    assert assign_resp.status_code == 200
    data = assign_resp.json()
    assert data["success"] is True
    assert data["data"]["status"] == "DISPATCHED"


def test_admin_system_status():
    response = client.get("/api/v1/admin/system-status")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["overall_status"] == "OPERATIONAL"
    assert len(data["data"]["subsystems"]) == 4
