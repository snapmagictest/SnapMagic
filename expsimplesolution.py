#!/usr/bin/env python3
"""
SIMPLE SOLUTION with PROPER Billboard Screen Mapping
===================================================

1. Use deployer.py to get Funko Pop figures
2. Cut out the figure (remove background)  
3. Map content to ACTUAL billboard screen coordinates using homography
4. Apply proper large-to-small perspective effect

Based on proper homography mapping approach
"""

import os
from PIL import Image, ImageFilter, ImageDraw, ImageFont
import numpy as np
import cv2
from deployer import CleanFunkoPopGenerator

def map_to_billboard_screen(pil_image, screen_corners, target_size=(800, 600)):
    """
    Map content to actual billboard screen coordinates using homography
    This creates the proper large-to-small perspective effect
    
    Args:
        pil_image: PIL Image to map to screen
        screen_corners: 4 corner points of billboard screen area [(x1,y1), (x2,y2), (x3,y3), (x4,y4)]
        target_size: Size to resize content before mapping
    """
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
    
    # Apply perspective transformation to map content to screen
    if has_alpha:
        # For RGBA content
        mapped_content = cv2.warpPerspective(
            content_cv, homography_matrix, (1024, 1024),  # Billboard size
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=(0, 0, 0, 0)  # Transparent fill
        )
        
        # Convert back to PIL with alpha cleanup
        result_array = cv2.cvtColor(mapped_content, cv2.COLOR_BGRA2RGBA)
        result_pil = Image.fromarray(result_array, 'RGBA')
        
        # Clean up white artifacts in transparent areas
        data = np.array(result_pil)
        mask = data[:, :, 3] < 10  # Alpha less than 10
        data[mask] = [0, 0, 0, 0]  # Make fully transparent
        result_pil = Image.fromarray(data, 'RGBA')
        
        return result_pil
    else:
        # For RGB content
        mapped_content = cv2.warpPerspective(
            content_cv, homography_matrix, (1024, 1024),  # Billboard size
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_TRANSPARENT
        )
        
        result_array = cv2.cvtColor(mapped_content, cv2.COLOR_BGR2RGB)
        return Image.fromarray(result_array, 'RGB')

def cut_out_figure(image_path):
    """Cut out figure from white background"""
    
    # Open image
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)
    
    # Remove white background
    white_threshold = 240
    white_mask = (data[:, :, 0] > white_threshold) & (data[:, :, 1] > white_threshold) & (data[:, :, 2] > white_threshold)
    
    # Create alpha channel
    alpha = np.ones(data.shape[:2], dtype=np.uint8) * 255
    alpha[white_mask] = 0
    
    # Apply alpha
    data[:, :, 3] = alpha
    
    # Convert back to PIL and smooth edges
    result = Image.fromarray(data, 'RGBA')
    mask = result.split()[3]
    feathered_mask = mask.filter(ImageFilter.GaussianBlur(radius=1))
    
    r, g, b, _ = result.split()
    return Image.merge('RGBA', (r, g, b, feathered_mask))

def put_in_billboard(figure_img, output_path):
    """Put figure in thebillboard.png using PROPER screen mapping with homography"""
    
    # Load billboard
    billboard = Image.open('thebillboard.png').convert("RGBA")
    bg_width, bg_height = billboard.size
    
    print("🎯 PROPER BILLBOARD SCREEN MAPPING")
    print(f"📐 Billboard dimensions: {bg_width}x{bg_height}")
    
    # 🎯 BETTER ALIGNED BILLBOARD SCREEN CORNERS
    # These coordinates define where the actual screen area is on the billboard
    # Adjusted for better alignment - text more left, figure more right
    screen_corners = [
        [200, 150],   # Top-left of screen
        [800, 140],   # Top-right of screen  
        [180, 550],   # Bottom-left of screen
        [820, 560]    # Bottom-right of screen
    ]
    
    print(f"📍 Billboard screen corners: {screen_corners}")
    
    # Start with the billboard as base
    result = billboard.copy()
    
    # 🎯 MAP FIGURE TO FAR RIGHT SIDE OF SCREEN - MOVED MORE RIGHT
    print("🔄 Mapping figure to far right side of billboard screen...")
    
    # Define far right side of screen for figure - MOVED MORE RIGHT
    figure_screen_corners = [
        [580, 142],   # Top-left of right area - MOVED FURTHER RIGHT
        [800, 140],   # Top-right of screen
        [570, 558],   # Bottom-left of right area - MOVED FURTHER RIGHT
        [820, 560]    # Bottom-right of screen
    ]
    
    # Map figure to screen with proper perspective
    mapped_figure = map_to_billboard_screen(figure_img, figure_screen_corners, target_size=(400, 400))
    
    # Composite mapped figure
    result = Image.alpha_composite(result, mapped_figure)
    print("✅ Figure mapped to billboard screen with proper perspective")
    
    # 🎯 CREATE AND MAP TEXT SECTION TO LEFT SIDE OF SCREEN
    print("🔄 Creating and mapping text section to left side of billboard screen...")
    
    # Create text content
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
                    font_large = ImageFont.truetype(font_path, 80)  # Large for screen mapping
                    font_medium = ImageFont.truetype(font_path, 65)  # Medium for screen mapping
                    break
            except:
                continue
        
        if not font_large:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
        
    except Exception as e:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
    
    # Add "Powered by AWS" logo to text canvas
    try:
        aws_logo = Image.open('PoweredByAWSw.png').convert("RGBA")
        
        # Scale logo for text canvas
        logo_scale = 0.4  # 40% of canvas width
        logo_width = int(text_canvas_width * logo_scale)
        logo_aspect = aws_logo.size[1] / aws_logo.size[0]
        logo_height = int(logo_width * logo_aspect)
        
        scaled_logo = aws_logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        
        # Position logo in text canvas
        logo_x = (text_canvas_width - logo_width) // 2
        logo_y = 50
        
        text_canvas.paste(scaled_logo, (logo_x, logo_y), scaled_logo)
        print(f"✅ Powered by AWS logo added to text canvas")
        
    except Exception as e:
        print(f"⚠️ Powered by AWS logo not found: {e}")
        logo_y = 50
        logo_height = 80
    
    # Add text to canvas
    text_color = (255, 255, 255)  # White
    outline_color = (0, 0, 0)  # Black outline
    outline_width = 4
    
    # Position text below logo
    johannesburg_y = logo_y + logo_height + 60
    summit_y = johannesburg_y + 100
    
    # Draw JOHANNESBURG
    johannesburg_text = "JOHANNESBURG"
    bbox = text_draw.textbbox((0, 0), johannesburg_text, font=font_large)
    text_width = bbox[2] - bbox[0]
    johannesburg_x = (text_canvas_width - text_width) // 2
    
    # Draw outline
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                text_draw.text((johannesburg_x + dx, johannesburg_y + dy), johannesburg_text, 
                             font=font_large, fill=outline_color)
    
    # Draw main text
    text_draw.text((johannesburg_x, johannesburg_y), johannesburg_text, 
                   font=font_large, fill=text_color)
    
    # Draw SUMMIT 2025
    summit_text = "SUMMIT 2025"
    bbox = text_draw.textbbox((0, 0), summit_text, font=font_medium)
    text_width = bbox[2] - bbox[0]
    summit_x = (text_canvas_width - text_width) // 2
    
    # Draw outline
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                text_draw.text((summit_x + dx, summit_y + dy), summit_text, 
                             font=font_medium, fill=outline_color)
    
    # Draw main text
    text_draw.text((summit_x, summit_y), summit_text, 
                   font=font_medium, fill=text_color)
    
    print(f"✅ Text added to canvas: JOHANNESBURG and SUMMIT 2025")
    
    # Define FAR LEFT side of screen for text - MOVED MORE LEFT
    text_screen_corners = [
        [200, 150],   # Top-left of screen
        [420, 147],   # Top-right of left area - MOVED MORE LEFT
        [180, 550],   # Bottom-left of screen
        [410, 557]    # Bottom-right of left area - MOVED MORE LEFT
    ]
    
    # Map text section to screen with proper perspective
    mapped_text = map_to_billboard_screen(text_canvas, text_screen_corners, target_size=(600, 500))
    
    # Composite mapped text
    result = Image.alpha_composite(result, mapped_text)
    print("✅ Text section mapped to billboard screen with proper perspective")
    
    print("🎉 PROPER billboard screen mapping complete!")
    
    # Save
    final = result.convert("RGB")
    final.save(output_path, "JPEG", quality=95)
    
    return output_path

def simple_solution(input_image, output_path):
    """Complete simple solution"""
    
    print(f"🎯 SIMPLE SOLUTION: {input_image}")
    
    # Step 1: Generate Funko Pop using deployer.py
    print("📦 Step 1: Generate Funko Pop...")
    generator = CleanFunkoPopGenerator()
    
    temp_funko = output_path.replace('.jpg', '_temp.jpg')
    result = generator.generate_funko_pop(input_image, temp_funko)
    
    if not result['success']:
        print(f"❌ Funko generation failed: {result['error']}")
        return False
    
    print(f"✅ Funko Pop generated: {temp_funko}")
    
    # Step 2: Cut out figure
    print("✂️ Step 2: Cut out figure...")
    figure = cut_out_figure(temp_funko)
    print("✅ Figure cut out")
    
    # Step 3: Put in thebillboard.png
    print("🏙️ Step 3: Put in thebillboard.png...")
    final_path = put_in_billboard(figure, output_path)
    print(f"✅ Complete: {final_path}")
    
    # Clean up
    try:
        os.remove(temp_funko)
    except:
        pass
    
    return True

if __name__ == "__main__":
    os.makedirs('simple_results', exist_ok=True)
    
    success = simple_solution(
        'test/bear.PNG',
        'simple_results/simple_solution.jpg'
    )
    
    if success:
        print("🎉 SIMPLE SOLUTION SUCCESS!")
    else:
        print("❌ SIMPLE SOLUTION FAILED!")
