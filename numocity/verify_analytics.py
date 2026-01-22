import requests

BASE_URL = "http://127.0.0.1:5000"

def test_analytics():
    session = requests.Session()
    session.post(f"{BASE_URL}/login", data={"username": "admin", "password": "admin"})
    
    # 1. Test Analytics API
    resp = session.get(f"{BASE_URL}/api/analytics")
    print("Analytics Data:", resp.json())
    
    # 2. Test CSV Export
    export_resp = session.get(f"{BASE_URL}/operator/export")
    print("CSV Export Preview (first 100 chars):", export_resp.text[:100])

if __name__ == "__main__":
    test_analytics()
