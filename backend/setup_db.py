import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

from loguru import logger

def setup_database():
    """Create the pose_detection database if it doesn't exist."""
    logger.info("🐘 Setting up PostgreSQL database...")
    
    # Load environment variables
    load_dotenv()
    
    # Default credentials
    db_user = "postgres"
    db_password = "root"
    db_host = "localhost"
    db_port = "5432"
    db_name = "pose_detection"
    
    try:
        # Connect to default postgres database
        conn = psycopg2.connect(
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cur.fetchone()
        
        if not exists:
            logger.info(f"🛠️ Creating database '{db_name}'...")
            cur.execute(f"CREATE DATABASE {db_name}")
            logger.success(f"✅ Database '{db_name}' created successfully!")
        else:
            logger.info(f"ℹ️ Database '{db_name}' already exists.")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        logger.error(f"❌ Error setting up database: {e}")
        logger.warning("\nPossible issues:\n1. PostgreSQL is not running.\n2. 'postgres' user or 'password' password is incorrect.\n3. psycopg2 is not installed.")

if __name__ == "__main__":
    setup_database()
