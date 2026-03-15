"""
Backend API Integration Tests - Auth and Health
Tests: Health, Registration, Login
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://driver-client-hub-1.preview.emergentagent.com').rstrip('/')
API_URL = f"{BASE_URL}/api"


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check_returns_200(self):
        """Health endpoint should return 200 with status healthy"""
        response = requests.get(f"{API_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        assert data['service'] == 'GruaApp API'
        assert data['version'] == '1.0.0'


class TestUserRegistration:
    """Test user registration with OTP"""
    
    def test_client_registration_success(self, api_client, unique_email, unique_phone):
        """Client registration should return token and user data"""
        payload = {
            "email": unique_email,
            "password": "TestPass123!",
            "full_name": "Test Client User",
            "phone": unique_phone,
            "role": "client"
        }
        response = api_client.post(f"{API_URL}/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        assert 'token' in data
        assert 'user' in data
        assert data['user']['email'] == unique_email
        assert data['user']['role'] == 'client'
        assert data['user']['verified'] == False  # OTP not verified yet
    
    def test_driver_registration_success(self, api_client, unique_email, unique_phone):
        """Driver registration should return token and user data"""
        payload = {
            "email": unique_email,
            "password": "TestPass123!",
            "full_name": "Test Driver User",
            "phone": unique_phone,
            "role": "driver"
        }
        response = api_client.post(f"{API_URL}/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        assert 'token' in data
        assert data['user']['role'] == 'driver'
    
    def test_duplicate_email_registration_fails(self, api_client):
        """Registration with existing email should fail"""
        response = api_client.post(f"{API_URL}/auth/register", json={
            "email": "admin@gruaapp.com",
            "password": "TestPass123!",
            "full_name": "Duplicate User",
            "phone": "3001234567",
            "role": "client"
        })
        assert response.status_code == 400
        assert "ya registrado" in response.json().get('detail', '').lower()


class TestUserLogin:
    """Test user login flow"""
    
    def test_admin_login_success(self, api_client):
        """Admin login should return token and redirect info"""
        response = api_client.post(f"{API_URL}/auth/login", json={
            "email": "admin@gruaapp.com",
            "password": "Admin2026!"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert 'token' in data
        assert data['user']['role'] == 'admin'
        assert data['message'] == 'Login exitoso'
    
    def test_login_wrong_password_fails(self, api_client):
        """Login with wrong password should fail"""
        response = api_client.post(f"{API_URL}/auth/login", json={
            "email": "admin@gruaapp.com",
            "password": "WrongPassword123!"
        })
        assert response.status_code == 401
        assert "inválidas" in response.json().get('detail', '').lower()
    
    def test_login_nonexistent_user_fails(self, api_client):
        """Login with non-existent email should fail"""
        response = api_client.post(f"{API_URL}/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "TestPass123!"
        })
        assert response.status_code == 401
