"""
Billboard Generator Service
Creates Times Square billboards with dual-screen approach
"""

import base64
import logging
from typing import Dict, Any
from PIL import Image, ImageDraw, ImageFont
import io
import numpy as np

# Import our Funko generator
from .funko_generator import create_funko_pop

logger = logging.getLogger(__name__)

class BillboardGenerator:
    
    def __init__(self):
        # Define the exact screen coordinates from the working solution
        self.left_screen_corners = [[251, 530], [434, 104], [242, 787], [459, 649]]
        self.right_screen_corners = [[599, 87], [774, 266], [583, 627], [804, 708]]
        
        logger.info("🎯 Billboard Generator initialized")
        logger.info("📺 LEFT SCREEN: Logo + Text")
        logger.info("📺 RIGHT SCREEN: Figure")
        logger.info("🌊 CENTER CURVE: Physical separation")

    def create_text_content(self, canvas_width: int = 800, canvas_height: int = 600) -> Image.Image:
        """Create the left screen text content with AWS branding"""
        try:
            # Create text canvas
            text_canvas = Image.new('RGBA', (canvas_width, canvas_height), (0, 0, 0, 0))
            text_draw = ImageDraw.Draw(text_canvas)
            
            # Use default fonts (Lambda environment)
            try:
                font_large = ImageFont.load_default()
                font_medium = ImageFont.load_default()
            except Exception:
                font_large = ImageFont.load_default()
                font_medium = ImageFont.load_default()
            
            # Colors
            aws_orange = (255, 165, 0)  # AWS Orange
            text_color = (255, 255, 255)  # White
            outline_color = (0, 0, 0)  # Black outline
            outline_width = 2
            
            # "Powered by AWS" logo text
            logo_text = "Powered by AWS"
            bbox = text_draw.textbbox((0, 0), logo_text, font=font_large)
            logo_width = bbox[2] - bbox[0]
            logo_x = (canvas_width - logo_width) // 2
            logo_y = 50
            
            # Draw logo with outline
            for dx in range(-outline_width, outline_width + 1):
                for dy in range(-outline_width, outline_width + 1):
                    if dx != 0 or dy != 0:
                        text_draw.text((logo_x + dx, logo_y + dy), logo_text, 
                                     font=font_large, fill=outline_color)
            
            text_draw.text((logo_x, logo_y), logo_text, font=font_large, fill=aws_orange)
            
            # Main text positioning
            johannesburg_y = logo_y + 100
            summit_y = johannesburg_y + 80
            
            # Draw "JOHANNESBURG"
            johannesburg_text = "JOHANNESBURG"
            bbox = text_draw.textbbox((0, 0), johannesburg_text, font=font_large)
            text_width = bbox[2] - bbox[0]
            johannesburg_x = (canvas_width - text_width) // 2
            
            for dx in range(-outline_width, outline_width + 1):
                for dy in range(-outline_width, outline_width + 1):
                    if dx != 0 or dy != 0:
                        text_draw.text((johannesburg_x + dx, johannesburg_y + dy), johannesburg_text, 
                                     font=font_large, fill=outline_color)
            
            text_draw.text((johannesburg_x, johannesburg_y), johannesburg_text, 
                           font=font_large, fill=text_color)
            
            # Draw "SUMMIT 2025"
            summit_text = "SUMMIT 2025"
            bbox = text_draw.textbbox((0, 0), summit_text, font=font_medium)
            text_width = bbox[2] - bbox[0]
            summit_x = (canvas_width - text_width) // 2
            
            for dx in range(-outline_width, outline_width + 1):
                for dy in range(-outline_width, outline_width + 1):
                    if dx != 0 or dy != 0:
                        text_draw.text((summit_x + dx, summit_y + dy), summit_text, 
                                     font=font_medium, fill=outline_color)
            
            text_draw.text((summit_x, summit_y), summit_text, 
                           font=font_medium, fill=text_color)
            
            logger.info("✅ Text content created")
            return text_canvas
            
        except Exception as e:
            logger.error(f"Text content creation failed: {str(e)}")
            # Return simple fallback
            fallback_canvas = Image.new('RGBA', (canvas_width, canvas_height), (0, 0, 0, 255))
            return fallback_canvas

    def simple_perspective_transform(self, image: Image.Image, target_corners: list, target_size: tuple = (400, 500)) -> Image.Image:
        """Simple perspective transformation for Lambda environment (without OpenCV)"""
        try:
            # Resize the image to target size
            resized_image = image.resize(target_size, Image.Resampling.LANCZOS)
            
            # For Lambda environment, we'll use a simplified approach
            # Create a new image with the billboard dimensions
            billboard_canvas = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
            
            # Calculate approximate position based on target corners
            min_x = min(corner[0] for corner in target_corners)
            max_x = max(corner[0] for corner in target_corners)
            min_y = min(corner[1] for corner in target_corners)
            max_y = max(corner[1] for corner in target_corners)
            
            # Calculate center position
            center_x = (min_x + max_x) // 2
            center_y = (min_y + max_y) // 2
            
            # Calculate paste position (centered on the screen area)
            paste_x = center_x - (target_size[0] // 2)
            paste_y = center_y - (target_size[1] // 2)
            
            # Ensure we don't go outside bounds
            paste_x = max(0, min(1024 - target_size[0], paste_x))
            paste_y = max(0, min(1024 - target_size[1], paste_y))
            
            # Paste the resized image
            if resized_image.mode == 'RGBA':
                billboard_canvas.paste(resized_image, (paste_x, paste_y), resized_image)
            else:
                billboard_canvas.paste(resized_image, (paste_x, paste_y))
            
            return billboard_canvas
            
        except Exception as e:
            logger.error(f"Perspective transform failed: {str(e)}")
            # Return the original resized image as fallback
            return image.resize(target_size, Image.Resampling.LANCZOS)

    def create_times_square_billboard(self, selfie_base64: str) -> str:
        """Create complete Times Square billboard from selfie"""
        try:
            logger.info("🎯 DUAL SCREEN BILLBOARD CREATION")
            
            # Step 1: Generate Funko Pop
            logger.info("📦 Step 1: Generate Funko Pop...")
            funko_base64 = create_funko_pop(selfie_base64)
            
            # Step 2: Load billboard background (create dark night sky)
            logger.info("🏙️ Step 2: Create billboard background...")
            billboard = Image.new('RGB', (1024, 1024), (20, 20, 40))  # Dark blue night sky
            billboard_rgba = billboard.convert("RGBA")
            
            # Step 3: Process Funko Pop figure
            logger.info("✂️ Step 3: Process figure...")
            funko_bytes = base64.b64decode(funko_base64)
            funko_image = Image.open(io.BytesIO(funko_bytes)).convert("RGBA")
            
            # Step 4: Map figure to RIGHT screen
            logger.info("📺 Step 4: Mapping figure to RIGHT billboard screen...")
            mapped_figure = self.simple_perspective_transform(
                funko_image, 
                self.right_screen_corners, 
                (400, 500)
            )
            
            # Composite figure onto billboard
            billboard_rgba = Image.alpha_composite(billboard_rgba, mapped_figure)
            logger.info("✅ Figure mapped to RIGHT screen")
            
            # Step 5: Create text content for LEFT screen
            logger.info("📝 Step 5: Creating text content for LEFT screen...")
            text_content = self.create_text_content()
            
            # Step 6: Map text to LEFT screen
            logger.info("📺 Step 6: Mapping text to LEFT billboard screen...")
            mapped_text = self.simple_perspective_transform(
                text_content, 
                self.left_screen_corners, 
                (400, 400)
            )
            
            # Composite text onto billboard
            final_billboard = Image.alpha_composite(billboard_rgba, mapped_text)
            logger.info("✅ Text mapped to LEFT screen")
            
            # Convert final result to base64
            buffer = io.BytesIO()
            final_billboard.convert("RGB").save(buffer, format='JPEG', quality=95)
            result_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            logger.info("🎉 DUAL SCREEN BILLBOARD COMPLETE")
            logger.info("📺 LEFT SCREEN: Logo + Text")
            logger.info("📺 RIGHT SCREEN: Figure")
            
            return result_base64
            
        except Exception as e:
            logger.error(f"Billboard creation failed: {str(e)}")
            raise Exception(f"Billboard creation failed: {str(e)}")

# Convenience function for Lambda handler
def create_times_square_billboard(selfie_base64: str) -> str:
    """Create a Times Square billboard from a selfie"""
    generator = BillboardGenerator()
    return generator.create_times_square_billboard(selfie_base64)
