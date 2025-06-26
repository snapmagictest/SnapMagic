#!/usr/bin/env python3
"""
Test script for Nova Reel video generation
"""

import json
import sys
import os

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from card_generator import SnapMagicCardGenerator

def test_video_generation():
    """Test video generation with a sample card"""
    
    print("🎬 Testing Nova Reel Video Generation...")
    
    # Initialize generator
    generator = SnapMagicCardGenerator()
    
    # Sample base64 image (small test image)
    # This would normally be a generated trading card
    sample_card_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    # Test animation prompts
    test_prompts = [
        "Make this trading card glow with magical energy",
        "Add subtle floating particles around the character",
        "Create a gentle breathing animation for the character"
    ]
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n🎯 Test {i}: {prompt}")
        
        result = generator.generate_video_from_card(
            card_image_base64=sample_card_base64,
            animation_prompt=prompt
        )
        
        if result['success']:
            print(f"✅ Video generated successfully!")
            print(f"   Duration: {result.get('duration', 'Unknown')}")
            print(f"   Format: {result.get('format', 'Unknown')}")
            print(f"   Video size: {len(result.get('video_base64', ''))} characters")
        else:
            print(f"❌ Video generation failed: {result.get('error', 'Unknown error')}")
    
    print("\n🎬 Video generation test completed!")

if __name__ == "__main__":
    test_video_generation()
