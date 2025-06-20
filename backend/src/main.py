"""
SnapMagic Backend API using FastAPI and Strands Agents
Provides REST API endpoints for AI-powered image and video transformation
"""

import logging
import json
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from snapmagic_tools import create_snapmagic_agent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SnapMagic AI Backend",
    description="AI-powered image and video transformation for AWS events",
    version="1.0.0"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SnapMagic agent
snapmagic_agent = create_snapmagic_agent()

# Request/Response models
class TransformImageRequest(BaseModel):
    prompt: str = Field(..., description="Text description of desired transformation")
    image_base64: str = Field(..., description="Base64 encoded image data")

class GenerateVideoRequest(BaseModel):
    prompt: str = Field(..., description="Text description of desired video")
    image_base64: str = Field(..., description="Base64 encoded source image")

class DetectGestureRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image data")

class TranscribeAudioRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64 encoded audio data")

class AIResponse(BaseModel):
    success: bool
    result: str
    message: str

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "SnapMagic AI Backend"}

# Image transformation endpoint
@app.post("/api/transform-image", response_model=AIResponse)
async def transform_image_endpoint(request: TransformImageRequest):
    """
    Transform user's selfie using AI image generation
    """
    try:
        logger.info(f"Received image transformation request: {request.prompt[:50]}...")
        
        # Use SnapMagic agent to transform image
        result = snapmagic_agent(
            f"Transform this image with the following prompt: {request.prompt}. "
            f"Image data: {request.image_base64[:100]}..."
        )
        
        # Check if result contains error
        if result.message.startswith("Error:"):
            return AIResponse(
                success=False,
                result="",
                message=result.message
            )
        
        return AIResponse(
            success=True,
            result=result.message,
            message="Image transformation completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Image transformation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transformation failed: {str(e)}")

# Video generation endpoint
@app.post("/api/generate-video", response_model=AIResponse)
async def generate_video_endpoint(request: GenerateVideoRequest):
    """
    Generate video from user's photo using AI
    """
    try:
        logger.info(f"Received video generation request: {request.prompt[:50]}...")
        
        # Use SnapMagic agent to generate video
        result = snapmagic_agent(
            f"Generate a video with the following prompt: {request.prompt}. "
            f"Source image data: {request.image_base64[:100]}..."
        )
        
        # Check if result contains error
        if result.message.startswith("Error:"):
            return AIResponse(
                success=False,
                result="",
                message=result.message
            )
        
        return AIResponse(
            success=True,
            result=result.message,
            message="Video generation completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Video generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")

# Gesture detection endpoint
@app.post("/api/detect-gesture", response_model=AIResponse)
async def detect_gesture_endpoint(request: DetectGestureRequest):
    """
    Detect thumbs up/down gestures for feedback collection
    """
    try:
        logger.info("Received gesture detection request")
        
        # Use SnapMagic agent to detect gesture
        result = snapmagic_agent(
            f"Detect gestures in this image. Image data: {request.image_base64[:100]}..."
        )
        
        # Check if result contains error
        if result.message.startswith("Error:"):
            return AIResponse(
                success=False,
                result="",
                message=result.message
            )
        
        return AIResponse(
            success=True,
            result=result.message,
            message="Gesture detection completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Gesture detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gesture detection failed: {str(e)}")

# Speech transcription endpoint
@app.post("/api/transcribe-audio", response_model=AIResponse)
async def transcribe_audio_endpoint(request: TranscribeAudioRequest):
    """
    Convert speech to text for voice prompts
    """
    try:
        logger.info("Received audio transcription request")
        
        # Use SnapMagic agent to transcribe audio
        result = snapmagic_agent(
            f"Transcribe this audio to text. Audio data: {request.audio_base64[:100]}..."
        )
        
        return AIResponse(
            success=True,
            result=result.message,
            message="Audio transcription completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Audio transcription failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audio transcription failed: {str(e)}")

# Generic AI endpoint for complex queries
@app.post("/api/snapmagic")
async def snapmagic_endpoint(request: Request):
    """
    Generic SnapMagic AI endpoint for complex queries
    """
    try:
        body = await request.json()
        query = body.get("query", "")
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        logger.info(f"Received SnapMagic query: {query[:100]}...")
        
        # Use SnapMagic agent to process query
        result = snapmagic_agent(query)
        
        return {
            "success": True,
            "result": result.message,
            "message": "Query processed successfully"
        }
        
    except Exception as e:
        logger.error(f"SnapMagic query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

if __name__ == "__main__":
    # Run the FastAPI server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
