import sys
import os
sys.path.insert(0, os.path.abspath("."))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
print("--- RUNNING FULL PHASE 3A SUITE ---")

# 1. Departments check
r_dept = client.get("/departments/")
print("1. Departments API: status =", r_dept.status_code, "count =", len(r_dept.json().get("departments", [])))
assert r_dept.status_code == 200
assert len(r_dept.json().get("departments", [])) >= 20

# 2. Existing login check (EMP001 Admin, EMP002 Inspector, EMP003 Viewer)
for emp, expected_role in [("EMP001", "Admin"), ("EMP002", "Inspector"), ("EMP003", "Viewer")]:
    r_l = client.post("/users/login/", json={"employee_id": emp, "password": "password123"})
    assert r_l.status_code == 200, f"Login failed for {emp}"
    role = r_l.json().get("role")
    dept = r_l.json().get("department_name")
    assert role == expected_role, f"Role mismatch for {emp}: expected {expected_role}, got {role}"
    print(f"2. Login verified: {emp} -> Role: {role}, Dept: {dept}")

# 3. Input validation: missing required field
r_val1 = client.post("/access-requests/", json={})
print("3a. Empty payload: status =", r_val1.status_code)
assert r_val1.status_code == 422

# 3b. Input validation: invalid mobile
r_val2 = client.post("/access-requests/", json={
    "full_name": "Ramesh Patel",
    "employee_id": "POL1234",
    "official_email": "ramesh@police.gov.in",
    "mobile_number": "12345",
    "department_id": 1,
    "designation": "Inspector",
    "office_unit": "Cyber Cell",
    "district": "Ahmedabad",
    "requested_role": "Inspector",
    "reason": "Need access for investigation."
})
print("3b. Invalid mobile: status =", r_val2.status_code)
assert r_val2.status_code == 422

# 3c. Input validation: disallowed role 'SuperAdmin'
r_val3 = client.post("/access-requests/", json={
    "full_name": "Ramesh Patel",
    "employee_id": "POL1234",
    "official_email": "ramesh@police.gov.in",
    "mobile_number": "9876543210",
    "department_id": 1,
    "designation": "Inspector",
    "office_unit": "Cyber Cell",
    "district": "Ahmedabad",
    "requested_role": "SuperAdmin",
    "reason": "Need access for investigation."
})
print("3c. Disallowed role: status =", r_val3.status_code)
assert r_val3.status_code == 422

# 3d. Existing registered employee check
r_val4 = client.post("/access-requests/", json={
    "full_name": "Admin Officer",
    "employee_id": "EMP001",
    "official_email": "admin@police.gov.in",
    "mobile_number": "9876543210",
    "department_id": 1,
    "designation": "Admin",
    "office_unit": "HQ",
    "district": "Ahmedabad",
    "requested_role": "Admin",
    "reason": "Already an existing user."
})
print("3d. Existing user check: status =", r_val4.status_code, "detail =", r_val4.json().get("detail"))
assert r_val4.status_code == 400

# 3e. Invalid department ID
r_val5 = client.post("/access-requests/", json={
    "full_name": "Ramesh Patel",
    "employee_id": "POL9999",
    "official_email": "ramesh@police.gov.in",
    "mobile_number": "9876543210",
    "department_id": 9999,
    "designation": "Inspector",
    "office_unit": "HQ",
    "district": "Ahmedabad",
    "requested_role": "Inspector",
    "reason": "Non-existent department."
})
print("3e. Invalid department ID: status =", r_val5.status_code, "detail =", r_val5.json().get("detail"))
assert r_val5.status_code == 400

# 3f. Valid submission on unmigrated table (expects clean HTTP 503)
r_val6 = client.post("/access-requests/", json={
    "full_name": "Ramesh Patel",
    "employee_id": "NEWPOL888",
    "official_email": "ramesh.patel@police.gujarat.gov.in",
    "mobile_number": "9876543210",
    "department_id": 1,
    "designation": "Sub-Inspector",
    "office_unit": "Navrangpura PS",
    "district": "Ahmedabad",
    "requested_role": "Inspector",
    "reason": "Official duty for CCTV surveillance monitoring."
})
print("3f. Valid submission on unmigrated table: status =", r_val6.status_code, "detail =", r_val6.json().get("detail"))
assert r_val6.status_code == 503
assert "001_create_access_requests.sql" in r_val6.json().get("detail")

# 4. RBAC on Admin routes
# 4a. Unauthenticated access
r_unauth = client.get("/access-requests/")
print("4a. Unauthenticated GET /access-requests/: status =", r_unauth.status_code)
assert r_unauth.status_code == 401

# 4b. Non-admin access (EMP002 - Inspector)
token_insp = client.post("/users/login/", json={"employee_id": "EMP002", "password": "password123"}).json().get("access_token")
r_insp = client.get("/access-requests/", headers={"Authorization": f"Bearer {token_insp}"})
print("4b. Inspector GET /access-requests/ (expect 403): status =", r_insp.status_code)
assert r_insp.status_code == 403

# 4c. Non-admin access (EMP003 - Viewer)
token_view = client.post("/users/login/", json={"employee_id": "EMP003", "password": "password123"}).json().get("access_token")
r_view = client.get("/access-requests/", headers={"Authorization": f"Bearer {token_view}"})
print("4c. Viewer GET /access-requests/ (expect 403): status =", r_view.status_code)
assert r_view.status_code == 403

# 4d. Admin access (EMP001 - Admin)
token_admin = client.post("/users/login/", json={"employee_id": "EMP001", "password": "password123"}).json().get("access_token")
r_admin = client.get("/access-requests/", headers={"Authorization": f"Bearer {token_admin}"})
print("4d. Admin GET /access-requests/: status =", r_admin.status_code)
if r_admin.status_code == 503:
    print("    Supabase table not yet applied (clean 503 returned):", r_admin.json().get("detail"))
elif r_admin.status_code == 200:
    print("    Supabase table exists! Requests count:", r_admin.json().get("count"))

# 5. Activation endpoints validation check
# 5a. Verify token validation error (too short or invalid)
r_tok1 = client.get("/access-requests/verify-token?token=short")
print("5a. Invalid short token: status =", r_tok1.status_code)
assert r_tok1.status_code == 422

# 5b. Activation password validation error (<8 characters)
r_act1 = client.post("/access-requests/activate", json={"token": "valid_length_token_1234567890", "password": "short"})
print("5b. Short password on activate: status =", r_act1.status_code)
assert r_act1.status_code == 422

# 6. Inactive account login check (HTTP 403)
from unittest.mock import patch, MagicMock

mock_inactive_user = MagicMock()
mock_inactive_user.data = [{
    "id": 999,
    "employee_id": "INACTIVE_EMP",
    "username": "Inactive Officer",
    "password": "$2b$12$dummyhash",
    "department_id": 1,
    "is_active": False
}]

with patch("routes.users.supabase") as mock_sb:
    mock_table = MagicMock()
    mock_select = MagicMock()
    mock_eq = MagicMock()
    mock_eq.execute.return_value = mock_inactive_user
    mock_select.eq.return_value = mock_eq
    mock_table.select.return_value = mock_select
    mock_sb.table.return_value = mock_table

    r_inactive = client.post("/users/login/", json={"employee_id": "INACTIVE_EMP", "password": "password123"})
    print("6. Inactive user login check (expect 403): status =", r_inactive.status_code, "detail =", r_inactive.json().get("detail"))
    assert r_inactive.status_code == 403
    assert "pending activation" in r_inactive.json().get("detail")

# 7. DEMO_MODE vs Production Mode Approval Logic
from routes.access_requests import is_demo_mode

print(f"7a. Checking is_demo_mode(): {is_demo_mode()} (expected True from .env)")
assert is_demo_mode() is True

# Test 7a: Approval flow under DEMO_MODE = True
mock_pending_req = MagicMock()
mock_pending_req.data = [{
    "id": 101,
    "request_id": "REQ-DEMO-001",
    "status": "PENDING",
    "full_name": "Demo Officer",
    "employee_id": "DEMO_EMP_001",
    "department_id": 1,
    "requested_role": "Inspector"
}]

mock_existing_user = MagicMock()
mock_existing_user.data = []  # User does not exist yet

mock_inserted_user = MagicMock()
mock_inserted_user.data = [{"id": 777}]

mock_inserted_role = MagicMock()
mock_inserted_role.data = [{"id": 888}]

mock_updated_req = MagicMock()
mock_updated_req.data = [{"id": 101}]

with patch("routes.access_requests.supabase") as mock_sb_ar:
    def fake_table(table_name):
        tbl = MagicMock()
        if table_name == "access_requests":
            # select eq execute
            sel = MagicMock()
            eq_mock = MagicMock()
            eq_mock.execute.return_value = mock_pending_req
            sel.eq.return_value = eq_mock
            tbl.select.return_value = sel
            
            # update eq execute
            upd = MagicMock()
            upd_eq = MagicMock()
            upd_eq.execute.return_value = mock_updated_req
            upd.eq.return_value = upd_eq
            tbl.update.return_value = upd
        elif table_name == "users":
            sel = MagicMock()
            eq_mock = MagicMock()
            eq_mock.execute.return_value = mock_existing_user
            sel.eq.return_value = eq_mock
            tbl.select.return_value = sel

            ins = MagicMock()
            ins.execute.return_value = mock_inserted_user
            tbl.insert.return_value = ins
        elif table_name == "roles":
            ins = MagicMock()
            ins.execute.return_value = mock_inserted_role
            tbl.insert.return_value = ins
        return tbl

    mock_sb_ar.table.side_effect = fake_table

    r_approve_demo = client.post(
        "/access-requests/REQ-DEMO-001/approve",
        json={"role": "Inspector"},
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    print("7a. DEMO_MODE approve: status =", r_approve_demo.status_code)
    assert r_approve_demo.status_code == 200
    res_data = r_approve_demo.json()
    assert res_data["status"] == "APPROVED"
    assert "demo_credentials" in res_data
    creds = res_data["demo_credentials"]
    assert creds["employee_id"] == "DEMO_EMP_001"
    assert creds["password"].startswith("Demo@")
    assert creds["role"] == "Inspector"
    print(f"    DEMO credentials generated (Admin only): ID={creds['employee_id']}, Role={creds['role']}")

# Test 7b: Approval flow under DEMO_MODE = False (Production Flow)
with patch("routes.access_requests.is_demo_mode", return_value=False):
    with patch("routes.access_requests.supabase") as mock_sb_ar2:
        mock_pending_req2 = MagicMock()
        mock_pending_req2.data = [{
            "id": 102,
            "request_id": "REQ-PROD-002",
            "status": "PENDING",
            "full_name": "Prod Officer",
            "employee_id": "PROD_EMP_002",
            "department_id": 2,
            "requested_role": "Viewer"
        }]

        mock_existing_user2 = MagicMock()
        mock_existing_user2.data = []

        mock_inserted_user2 = MagicMock()
        mock_inserted_user2.data = [{"id": 778}]

        captured_user_payload = {}
        def fake_table2(table_name):
            tbl = MagicMock()
            if table_name == "access_requests":
                sel = MagicMock()
                eq_mock = MagicMock()
                eq_mock.execute.return_value = mock_pending_req2
                sel.eq.return_value = eq_mock
                tbl.select.return_value = sel
                
                upd = MagicMock()
                upd_eq = MagicMock()
                upd_eq.execute.return_value = mock_updated_req
                upd.eq.return_value = upd_eq
                tbl.update.return_value = upd
            elif table_name == "users":
                sel = MagicMock()
                eq_mock = MagicMock()
                eq_mock.execute.return_value = mock_existing_user2
                sel.eq.return_value = eq_mock
                tbl.select.return_value = sel

                def capture_insert(payload):
                    captured_user_payload.update(payload)
                    ins = MagicMock()
                    ins.execute.return_value = mock_inserted_user2
                    return ins
                tbl.insert.side_effect = capture_insert
            elif table_name == "roles":
                ins = MagicMock()
                ins.execute.return_value = mock_inserted_role
                tbl.insert.return_value = ins
            return tbl

        mock_sb_ar2.table.side_effect = fake_table2

        r_approve_prod = client.post(
            "/access-requests/REQ-PROD-002/approve",
            json={"role": "Viewer"},
            headers={"Authorization": f"Bearer {token_admin}"}
        )
        print("7b. Production (DEMO_MODE=False) approve: status =", r_approve_prod.status_code)
        assert r_approve_prod.status_code == 200
        res_prod = r_approve_prod.json()
        assert res_prod["status"] == "APPROVED"
        assert "demo_credentials" not in res_prod
        assert "demo_activation_url" in res_prod
        assert res_prod["demo_activation_url"].startswith("/activate?token=")
        # Verify user account in DB was set to is_active=False and inactive marker
        assert captured_user_payload.get("is_active") is False
        assert captured_user_payload.get("password") == "!UNACTIVATED_ACCOUNT!"
        print("    Production inactive user provisioned with is_active=False and activation URL token")

print("--- ALL TEST SUITE ASSERTIONS PASSED SUCCESSFULLY ---")
