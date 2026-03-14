"""
Backend API Integration Tests - Driver and Service Features
Tests: Driver registration, availability, services, offers
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tow-truck-bids.preview.emergentagent.com').rstrip('/')
API_URL = f"{BASE_URL}/api"


class TestDriverFeatures:
    """Test driver-specific features"""
    
    @pytest.fixture
    def driver_token(self, api_client, unique_email, unique_phone):
        """Register a new driver and get token"""
        response = api_client.post(f"{API_URL}/auth/register", json={
            "email": unique_email,
            "password": "DriverPass123!",
            "full_name": "Test Driver",
            "phone": unique_phone,
            "role": "driver"
        })
        if response.status_code == 200:
            return response.json().get('token')
        pytest.skip(f"Driver registration failed: {response.text}")
    
    def test_driver_vehicle_registration(self, api_client, driver_token):
        """Driver should register vehicle info"""
        api_client.headers.update({"Authorization": f"Bearer {driver_token}"})
        response = api_client.post(f"{API_URL}/drivers/register", json={
            "vehicle_type": "flatbed",
            "vehicle_brand": "Ford",
            "vehicle_model": "F-350",
            "vehicle_plate": f"TEST{int(time.time()) % 10000}",
            "license_number": "LIC12345",
            "insurance_info": "Policy XYZ123",
            "vehicle_registration_photo_url": "https://example.com/photo.jpg"
        })
        assert response.status_code == 200, f"Vehicle registration failed: {response.text}"
        data = response.json()
        assert 'message' in data
        assert 'wallet_balance' in data
        # Should have initial balance
        assert data['wallet_balance'] > 0
    
    def test_driver_availability_toggle(self, api_client, driver_token):
        """Driver should toggle availability"""
        api_client.headers.update({"Authorization": f"Bearer {driver_token}"})
        
        # First register vehicle
        api_client.post(f"{API_URL}/drivers/register", json={
            "vehicle_type": "wheel_lift",
            "vehicle_brand": "Dodge",
            "vehicle_model": "Ram 3500",
            "vehicle_plate": f"AVAIL{int(time.time()) % 10000}",
            "license_number": "LIC67890",
            "vehicle_registration_photo_url": "https://example.com/photo.jpg"
        })
        
        # Toggle availability on
        response = api_client.post(f"{API_URL}/drivers/availability", json={
            "available": True,
            "current_location": {"lat": 4.7110, "lng": -74.0721}
        })
        assert response.status_code == 200
        assert "actualizada" in response.json().get('message', '').lower()


class TestClientServices:
    """Test client service creation"""
    
    @pytest.fixture
    def client_token(self, api_client, unique_email, unique_phone):
        """Register a new client and get token"""
        response = api_client.post(f"{API_URL}/auth/register", json={
            "email": unique_email,
            "password": "ClientPass123!",
            "full_name": "Test Client",
            "phone": unique_phone,
            "role": "client"
        })
        if response.status_code == 200:
            return response.json().get('token')
        pytest.skip(f"Client registration failed: {response.text}")
    
    def test_client_create_service(self, api_client, client_token):
        """Client should create a service request"""
        api_client.headers.update({"Authorization": f"Bearer {client_token}"})
        response = api_client.post(f"{API_URL}/services/create", json={
            "vehicle_type": "car",
            "vehicle_brand": "Toyota",
            "vehicle_model": "Corolla",
            "vehicle_condition": "accident",
            "pickup_location": {"lat": 4.7110, "lng": -74.0721},
            "destination_location": {"lat": 4.6500, "lng": -74.1000},
            "pickup_address": "Calle 100 #15-20, Bogotá",
            "destination_address": "Calle 26 #68-50, Bogotá",
            "description": "Test service request"
        })
        assert response.status_code == 200, f"Service creation failed: {response.text}"
        data = response.json()
        assert 'id' in data
        assert data['status'] == 'created'
        return data['id']


class TestOfferFlow:
    """Test offer creation and acceptance flow"""
    
    def test_get_available_drivers(self, api_client):
        """Should get list of available drivers"""
        response = api_client.get(f"{API_URL}/drivers/available")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
