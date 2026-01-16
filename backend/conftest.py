import sys
import os

# Add the project root to the python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

# Monkeypatch bcrypt for passlib compatibility
try:
    import bcrypt
    if not hasattr(bcrypt, "__about__"):
        class About:
            __version__ = "4.0.1"
        bcrypt.__about__ = About()
except ImportError:
    pass

# Monkeypatch bcrypt for passlib compatibility
try:
    import bcrypt
    if not hasattr(bcrypt, "__about__"):
        class About:
            __version__ = "4.0.1"
        bcrypt.__about__ = About()
except ImportError:
    pass

import pytest
from httpx import AsyncClient, ASGITransport
import app
print(f"DEBUG: app module file: {app.__file__}")
from main import app as fastapi_app

@pytest.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=fastapi_app), base_url="http://test") as client:
        yield client
