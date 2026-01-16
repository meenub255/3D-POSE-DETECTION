"""
Asynchronous Integration tests for FastAPI endpoints
"""
import pytest
import asyncio

@pytest.mark.asyncio
async def test_read_main(async_client):
    """Test health check endpoint"""
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

@pytest.mark.asyncio
async def test_api_docs_accessible(async_client):
    """Test that Swagger UI is accessible"""
    response = await async_client.get("/docs")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_user_flow(async_client):
    """Test registration and login flow"""
    import random
    rand = random.randint(1000, 9999)
    username = f"testuser_{rand}"
    email = f"test_{rand}@example.com"
    
    # 1. Register
    reg_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "username": username,
            "password": "testpassword",
            "full_name": "Test User"
        }
    )
    assert reg_response.status_code == 201
    
    # 2. Login
    login_response = await async_client.post(
        f"/api/v1/auth/login",
        data={"username": username, "password": "testpassword"},
        # OAuth2PasswordRequestForm usually expects x-www-form-urlencoded
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
