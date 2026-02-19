import requests

BASE_URL = "http://127.0.0.1:5000"

def test_app():
    session = requests.Session()
    
    print("--- 1. Testing Login as 'user' ---")
    login_data = {"username": "user", "password": "pass"}
    resp = session.post(f"{BASE_URL}/login", data=login_data, allow_redirects=True)
    if "Find & Charge" in resp.text and "Hello, user" in resp.text:
        print("SUCCESS: User login and dashboard access confirmed.")
    else:
        print("FAILED: User login failed or redirected to wrong page.")
        # print(resp.text[:500])

    print("\n--- 2. Testing Logic: Start Charging ---")
    # Assuming station 1 is "Downtown Plaza Charge" and Available
    charge_resp = session.get(f"{BASE_URL}/charge/1", allow_redirects=True)
    if "Charging started" in charge_resp.text or "Station is not available" in charge_resp.text:
        print("SUCCESS: Charging action route reachable.")
    else:
        print("FAILED: Charging action failed.")

    session.get(f"{BASE_URL}/logout")

    print("\n--- 3. Testing Login as 'admin' (Operator) ---")
    login_data_admin = {"username": "admin", "password": "admin"}
    resp_admin = session.post(f"{BASE_URL}/login", data=login_data_admin, allow_redirects=True)
    if "Network Status" in resp_admin.text and "Admin, admin" in resp_admin.text:
        print("SUCCESS: Operator login and dashboard access confirmed.")
    else:
        print("FAILED: Operator login failed.")

    print("\n--- 4. Testing Operator Functionality: Toggle Station ---")
    # Toggle station 1
    toggle_resp = session.get(f"{BASE_URL}/toggle_station/1", allow_redirects=True)
    if "Station Management" in toggle_resp.text:
        print("SUCCESS: Toggle station route reachable and returned to dashboard.")
    else:
        print("FAILED: Toggle station failed.")

if __name__ == "__main__":
    try:
        test_app()
    except Exception as e:
        print(f"ERROR: Could not connect to server: {e}")
