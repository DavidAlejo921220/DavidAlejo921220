"""
Shared pytest fixtures for backend tests
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://driver-client-hub-1.preview.emergentagent.com').rstrip('/')
API_URL = f"{BASE_URL}/api"

@pytest.fixture(scope='module')
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope='module')
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{API_URL}/auth/login", json={
        "email": "admin@gruaapp.com",
        "password": "Admin2026!"
    })
    if response.status_code == 200:
        token = response.json().get("token")
        return token
    pytest.skip(f"Admin authentication failed: {response.status_code} - {response.text}")

@pytest.fixture(scope='module')
def admin_client(api_client, admin_token):
    """Session with admin auth header"""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client

@pytest.fixture
def unique_email():
    """Generate unique test email"""
    import time
    return f"test_user_{int(time.time() * 1000)}@test.com"

@pytest.fixture
def unique_phone():
    """Generate unique test phone"""
    import time
    ts = str(int(time.time() * 1000))[-10:]
    return f"3{ts}"
