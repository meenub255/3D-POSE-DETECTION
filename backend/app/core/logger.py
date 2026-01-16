"""
Logging configuration using Loguru
"""
import sys
import logging
from loguru import logger
from app.core.config import settings


class InterceptHandler(logging.Handler):
    """
    Default handler from python logging to loguru.
    See: https://loguru.readthedocs.io/en/stable/overview.html#entirely-compatible-with-standard-logging
    """
    def emit(self, record):
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging():
    """Setup loguru logging"""
    
    # Remove default loguru handler
    logger.remove()
    
    # Add colored console logger for development
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
        colorize=True
    )
    
    # Add persistent file logger with rotation
    logger.add(
        "logs/app.log",
        rotation="10 MB",
        retention="10 days",
        level="DEBUG",
        compression="zip",
        enqueue=True
    )
    
    # Intercept standard logging (FastAPI, Uvicorn, SQLAlchemy)
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    for logger_name in ("uvicorn.access", "uvicorn.error", "fastapi", "sqlalchemy.engine"):
        logging_logger = logging.getLogger(logger_name)
        logging_logger.handlers = [InterceptHandler()]
        logging_logger.propagate = False
    
    logger.info("🎨 Logging system initialized with Loguru")

# Export logger
log = logger
