"""
Backend API Integration Tests - Admin Features
Tests: Dashboard, Wallet Management, Driver Recharge
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://driver-client-hub-1.preview.emergentagent.com').rstrip('/')
API_URL = f"{BASE_URL}/api"


class TestAdminDashboard:
    """Test admin dashboard endpoints"""
    
    def test_get_dashboard_with_admin_token(self, admin_client):
        """Admin should see dashboard statistics"""
        response = admin_client.get(f"{API_URL}/admin/dashboard")
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        assert 'total_services' in data
        assert 'active_services' in data
        assert 'total_users' in data
        assert 'total_drivers' in data
        assert 'total_revenue' in data
        assert 'total_commission' in data
    
    def test_get_dashboard_without_token_fails(self, api_client):
        """Dashboard without auth should fail"""
        # Create new session without auth
        session = requests.Session()
        response = session.get(f"{API_URL}/admin/dashboard")
        assert response.status_code in [401, 403]
    
    def test_get_all_users(self, admin_client):
        """Admin should get list of all users"""
        response = admin_client.get(f"{API_URL}/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have at least the admin user
        assert len(data) >= 1
        # Check user structure
        if data:
            user = data[0]
            assert 'id' in user
            assert 'email' in user
            assert 'full_name' in user
            assert 'role' in user


class TestWalletManagement:
    """Test admin wallet management for drivers"""
    
    def test_get_driver_wallets_empty(self, admin_client):
        """Admin should get list of driver wallets (may be empty initially)"""
        response = admin_client.get(f"{API_URL}/admin/drivers/wallets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_wallet_recharge_nonexistent_driver_fails(self, admin_client):
        """Recharge for non-existent driver should fail"""
        response = admin_client.post(f"{API_URL}/admin/drivers/recharge", json={
            "driver_id": "nonexistent-driver-id",
            "amount": 10000,
            "notes": "Test recharge"
        })
        assert response.status_code == 404
        assert "no encontrado" in response.json().get('detail', '').lower()


class TestCommissionConfig:
    """Test commission configuration endpoints"""
    
    def test_get_commission_config(self, admin_client):
        """Admin should get commission configuration"""
        response = admin_client.get(f"{API_URL}/admin/commission-config")
        assert response.status_code == 200
        data = response.json()
        assert 'default_rate' in data
        assert data['default_rate'] >= 0 and data['default_rate'] <= 1
    
    def test_update_commission_config(self, admin_client):
        """Admin should update commission configuration"""
        # Get current config
        get_response = admin_client.get(f"{API_URL}/admin/commission-config")
        current_config = get_response.json()
        
        # Update with same rate
        update_payload = {
            "default_rate": current_config.get('default_rate', 0.15),
            "vehicle_rates": {},
            "zone_rates": {}
        }
        response = admin_client.post(f"{API_URL}/admin/commission-config", json=update_payload)
        assert response.status_code == 200
        assert "actualizada" in response.json().get('message', '').lower()
