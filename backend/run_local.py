#!/usr/bin/env python3
"""
Local development server for SnapMagic AI backend
Run this script to test the backend locally before deployment
"""

import sys
import os
import logging

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

if __name__ == "__main__":
    try:
        from src.main import app
        import uvicorn
        
        print("🚀 Starting SnapMagic AI Backend...")
        print("📍 Server will be available at: http://localhost:8000")
        print("📖 API documentation at: http://localhost:8000/docs")
        print("🔍 Health check at: http://localhost:8000/health")
        print("\n💡 Press Ctrl+C to stop the server\n")
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n👋 SnapMagic AI Backend stopped")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)
