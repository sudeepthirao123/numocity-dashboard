import requests

BASE_URL = "http://127.0.0.1:5000"

def test_full_flow():
    session = requests.Session()
    
    print("--- Testing User Flow (Login -> Wallet -> Charge -> History) ---")
    
    # 1. Login
    login_data = {"username": "user", "password": "pass"}
    resp = session.post(f"{BASE_URL}/login", data=login_data, allow_redirects=True)
    if "$250.00" in resp.text:
        print("SUCCESS: Initial balance of $250 confirmed.")
    
    # 2. Add Money
    wallet_data = {"amount": "50"}
    resp = session.post(f"{BASE_URL}/wallet", data=wallet_data, allow_redirects=True)
    if "$300.00" in resp.text:
        print("SUCCESS: Wallet top-up to $300 confirmed.")
    
    # 3. Charge
    resp = session.get(f"{BASE_URL}/charge/1", allow_redirects=True)
    if "$284.50" in resp.text: # 300 - 15.50
        print("SUCCESS: Charge deducted correct amount, balance is $284.50.")
    
    # 4. History
    resp = session.get(f"{BASE_URL}/history", allow_redirects=True)
    if "Downtown Plaza Charge" in resp.text and "-$15.50" in resp.text:
        print("SUCCESS: Transaction history recorded correctly.")
    
    print("\n--- Testing Operator Dashboard ---")
    session.get(f"{BASE_URL}/logout")
    login_admin = {"username": "admin", "password": "admin"}
    resp = session.post(f"{BASE_URL}/login", data=login_admin, allow_redirects=True)
    if "Network Status" in resp.text:
        print("SUCCESS: Operator dashboard still works.")

if __name__ == "__main__":
    try:
        test_full_flow()
    except Exception as e:
        print(f"ERROR: {e}")
