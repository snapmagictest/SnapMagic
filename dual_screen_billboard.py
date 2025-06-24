#!/usr/bin/env python3
"""
Dual Screen Billboard Tool
=========================

Treats the billboard as TWO SEPARATE SCREENS:
- LEFT SCREEN: Logo + Text
- RIGHT SCREEN: Figure
- CENTER CURVE: Physical separation between screens

This is the CORRECT approach for the billboard image!
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont
from deployer import CleanFunkoPopGenerator

def map_to_billboard_screen(pil_image, screen_corners, target_size=(800, 600)):
    """Map content to billboard screen using homography"""
    # Resize content to target size first
    resized_content = pil_image.resize(target_size, Image.Resampling.LANCZOS)
    
    # Convert PIL to OpenCV format
    img_array = np.array(resized_content)
    if resized_content.mode == 'RGBA':
        content_cv = cv2.cvtColor(img_array, cv2.COLOR_RGBA2BGRA)
        has_alpha = True
    else:
        content_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        has_alpha = False
    
    # Get content dimensions
    h1, w1 = content_cv.shape[:2]
    
    # Source points (content rectangle corners)
    pts1 = np.float32([
        [0, 0],      # Top-left
        [w1, 0],     # Top-right  
        [0, h1],     # Bottom-left
        [w1, h1]     # Bottom-right
    ])
    
    # Destination points (billboard screen corners)
    pts2 = np.float32(screen_corners)
    
    # Calculate homography matrix
    homography_matrix, mask = cv2.findHomography(pts1, pts2, cv2.RANSAC, 5.0)
    
    # Apply perspective transformation
    if has_alpha:
        mapped_content = cv2.warpPerspective(
            content_cv, homography_matrix, (1024, 1024),
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=(0, 0, 0, 0)
        )
        
        result_array = cv2.cvtColor(mapped_content, cv2.COLOR_BGRA2RGBA)
        result_pil = Image.fromarray(result_array, 'RGBA')
        
        # Clean up white artifacts
        data = np.array(result_pil)
        mask = data[:, :, 3] < 10
        data[mask] = [0, 0, 0, 0]
        result_pil = Image.fromarray(data, 'RGBA')
        
        return result_pil
    else:
        mapped_content = cv2.warpPerspective(
            content_cv, homography_matrix, (1024, 1024),
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_TRANSPARENT
        )
        
        result_array = cv2.cvtColor(mapped_content, cv2.COLOR_BGR2RGB)
        return Image.fromarray(result_array, 'RGB')

def cut_out_figure(image_path):
    """Cut out figure from white background"""
    img = Image.open(image_path).convert("RGBA")
    
    # Convert to numpy array
    data = np.array(img)
    
    # Create mask for non-white pixels
    white_threshold = 240
    mask = (data[:, :, 0] < white_threshold) | \
           (data[:, :, 1] < white_threshold) | \
           (data[:, :, 2] < white_threshold)
    
    # Set alpha channel based on mask
    data[:, :, 3] = mask * 255
    
    # Convert back to PIL Image
    result = Image.fromarray(data, 'RGBA')
    
    return result

def create_dual_screen_billboard(figure_path, output_path):
    """Create billboard with TWO SEPARATE SCREENS"""
    
    print("🎯 DUAL SCREEN BILLBOARD CREATION")
    print("📺 LEFT SCREEN: Logo + Text")
    print("📺 RIGHT SCREEN: Figure")
    print("🌊 CENTER CURVE: Physical separation")
    
    # Step 1: Generate Funko Pop
    print("\n📦 Step 1: Generate Funko Pop...")
    generator = CleanFunkoPopGenerator()
    temp_funko = "simple_results/dual_temp.jpg"
    
    success = generator.generate_funko_pop(figure_path, temp_funko)
    
    if not success:
        print("❌ Failed to generate Funko Pop")
        return False
    
    print("✅ Funko Pop generated")
    
    # Step 2: Cut out figure
    print("✂️ Step 2: Cut out figure...")
    figure_img = cut_out_figure(temp_funko)
    print("✅ Figure cut out")
    
    # Step 3: Load billboard
    print("🏙️ Step 3: Load billboard...")
    billboard = Image.open('thebillboard.png').convert("RGBA")
    bg_width, bg_height = billboard.size
    print(f"📐 Billboard dimensions: {bg_width}x{bg_height}")
    
    # 🎯 DEFINE TWO SEPARATE BILLBOARD SCREENS
    print("\n🎯 DEFINING TWO SEPARATE BILLBOARD SCREENS:")
    
    # 🎯 EXACT COORDINATES PROVIDED BY USER
    print("\n🎯 USING EXACT USER-PROVIDED COORDINATES:")
    
    # LEFT BILLBOARD SCREEN coordinates (for logo + text) - USER PROVIDED
    # Perspective: Small on far left, big on far right
    left_screen_corners = [
        [251, 530],   # Top-left of LEFT screen
        [434, 104],   # Top-right of LEFT screen  
        [242, 787],   # Bottom-left of LEFT screen
        [459, 649]    # Bottom-right of LEFT screen
    ]
    
    # RIGHT BILLBOARD SCREEN coordinates (for figure) - USER PROVIDED
    # Top-right: [774,266], Bottom-right: [804,708], Left-bottom: [583,627], Left-top: [599,87]
    right_screen_corners = [
        [599, 87],    # Top-left of RIGHT screen (left-top)
        [774, 266],   # Top-right of RIGHT screen  
        [583, 627],   # Bottom-left of RIGHT screen (left-bottom)
        [804, 708]    # Bottom-right of RIGHT screen
    ]
    
    print(f"📍 LEFT screen corners: {left_screen_corners}")
    print(f"📍 RIGHT screen corners: {right_screen_corners}")
    
    # Start with billboard as base
    result = billboard.copy()
    
    # 🎯 STEP 4: MAP FIGURE TO RIGHT BILLBOARD SCREEN
    print("\n📺 Step 4: Mapping figure to RIGHT billboard screen...")
    mapped_figure = map_to_billboard_screen(figure_img, right_screen_corners, target_size=(400, 400))
    result = Image.alpha_composite(result, mapped_figure)
    print("✅ Figure mapped to RIGHT screen with proper perspective")
    
    # 🎯 STEP 5: CREATE TEXT CONTENT FOR LEFT SCREEN
    print("\n📝 Step 5: Creating text content for LEFT screen...")
    text_canvas_width = 600
    text_canvas_height = 500
    text_canvas = Image.new('RGBA', (text_canvas_width, text_canvas_height), (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_canvas)
    
    # Load fonts
    try:
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
            "/System/Library/Fonts/Monaco.ttf",
            "C:/Windows/Fonts/consola.ttf",
            "C:/Windows/Fonts/arial.ttf",
        ]
        
        font_large = None
        font_medium = None
        
        for font_path in font_paths:
            try:
                if os.path.exists(font_path):
                    font_large = ImageFont.truetype(font_path, 80)
                    font_medium = ImageFont.truetype(font_path, 65)
                    break
            except:
                continue
        
        if not font_large:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
        
    except Exception as e:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
    
    # Add "Powered by AWS" logo
    try:
        aws_logo = Image.open('PoweredByAWSw.png').convert("RGBA")
        logo_scale = 0.4
        logo_width = int(text_canvas_width * logo_scale)
        logo_aspect = aws_logo.size[1] / aws_logo.size[0]
        logo_height = int(logo_width * logo_aspect)
        
        scaled_logo = aws_logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        logo_x = (text_canvas_width - logo_width) // 2
        logo_y = 50
        
        text_canvas.paste(scaled_logo, (logo_x, logo_y), scaled_logo)
        print("✅ AWS logo added to text canvas")
        
    except Exception as e:
        print(f"⚠️ AWS logo not found: {e}")
        logo_y = 50
        logo_height = 80
    
    # Add text
    text_color = (255, 255, 255)
    outline_color = (0, 0, 0)
    outline_width = 4
    
    johannesburg_y = logo_y + logo_height + 60
    summit_y = johannesburg_y + 100
    
    # Draw JOHANNESBURG
    johannesburg_text = "JOHANNESBURG"
    bbox = text_draw.textbbox((0, 0), johannesburg_text, font=font_large)
    text_width = bbox[2] - bbox[0]
    johannesburg_x = (text_canvas_width - text_width) // 2
    
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                text_draw.text((johannesburg_x + dx, johannesburg_y + dy), johannesburg_text, 
                             font=font_large, fill=outline_color)
    
    text_draw.text((johannesburg_x, johannesburg_y), johannesburg_text, 
                   font=font_large, fill=text_color)
    
    # Draw SUMMIT 2025
    summit_text = "SUMMIT 2025"
    bbox = text_draw.textbbox((0, 0), summit_text, font=font_medium)
    text_width = bbox[2] - bbox[0]
    summit_x = (text_canvas_width - text_width) // 2
    
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                text_draw.text((summit_x + dx, summit_y + dy), summit_text, 
                             font=font_medium, fill=outline_color)
    
    text_draw.text((summit_x, summit_y), summit_text, 
                   font=font_medium, fill=text_color)
    
    print("✅ Text content created")
    
    # 🎯 STEP 6: MAP TEXT TO LEFT BILLBOARD SCREEN
    print("\n📺 Step 6: Mapping text to LEFT billboard screen...")
    mapped_text = map_to_billboard_screen(text_canvas, left_screen_corners, target_size=(600, 500))
    result = Image.alpha_composite(result, mapped_text)
    print("✅ Text mapped to LEFT screen with proper perspective")
    
    # Save result
    final = result.convert("RGB")
    final.save(output_path, "JPEG", quality=95)
    
    # Clean up
    try:
        os.remove(temp_funko)
    except:
        pass
    
    print(f"\n🎉 DUAL SCREEN BILLBOARD COMPLETE: {output_path}")
    print("📺 LEFT SCREEN: Logo + Text")
    print("📺 RIGHT SCREEN: Figure")
    return True

if __name__ == "__main__":
    os.makedirs('simple_results', exist_ok=True)
    
    print("🎯 DUAL SCREEN BILLBOARD TOOL")
    print("=" * 40)
    
    success = create_dual_screen_billboard(
        'test/bear.PNG',
        'simple_results/dual_screen_billboard.jpg'
    )
    
    if success:
        print("🎉 SUCCESS! Check simple_results/dual_screen_billboard.jpg")
    else:
        print("❌ FAILED!")
