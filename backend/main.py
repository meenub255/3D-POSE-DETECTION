"""
Main FastAPI application entry point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine
from app.db.base import Base
from app.core.logger import setup_logging, log as logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup logging setup
    setup_logging()
    logger.info("🚀 Starting 3D Pose Detection System...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    logger.info("👋 Shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="3D Pose Detection & Posture Analysis API",
    lifespan=lifespan
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    logger.info(
        f"Method: {request.method} | Path: {request.url.path} | "
        f"Status: {response.status_code} | Duration: {process_time:.2f}ms"
    )
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
