#!/usr/bin/env python3
"""
Interactive Billboard Alignment Tool
====================================

This tool allows you to:
1. Interactively click the 4 corners of the billboard screen for perfect alignment
2. Or use predefined coordinates for quick processing

Based on Q's solution for proper billboard screen mapping
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont
from deployer import CleanFunkoPopGenerator

# Configuration
use_interactive = True  # Set to True for interactive corner selection

# Global variables for interactive mode
positions = []
count = 0

def mouse_callback(event, x, y, flags, param):
    """Mouse callback function for interactive corner selection"""
    global positions, count
    
    if event == cv2.EVENT_LBUTTONUP:
        cv2.circle(param, (x, y), 5, (0, 255, 0), -1)  # Green circle
        positions.append([x, y])
        count += 1
        
        # Show instructions
        if count == 1:
            print(f"✅ Top-left corner selected: ({x}, {y})")
            print("👆 Click TOP-RIGHT corner of billboard screen")
        elif count == 2:
            print(f"✅ Top-right corner selected: ({x}, {y})")
            print("👆 Click BOTTOM-LEFT corner of billboard screen")
        elif count == 3:
            print(f"✅ Bottom-left corner selected: ({x}, {y})")
            print("👆 Click BOTTOM-RIGHT corner of billboard screen")
        elif count == 4:
            print(f"✅ Bottom-right corner selected: ({x}, {y})")
            print("🎉 All corners selected! Press ESC to continue...")

def get_billboard_corners(billboard_path):
    """Get billboard screen corners either interactively or predefined"""
    global positions, count
    
    if use_interactive:
        print("🎯 INTERACTIVE BILLBOARD CORNER SELECTION")
        print("👆 Click the 4 corners of the billboard SCREEN in this order:")
        print("   1. TOP-LEFT corner of screen")
        print("   2. TOP-RIGHT corner of screen") 
        print("   3. BOTTOM-LEFT corner of screen")
        print("   4. BOTTOM-RIGHT corner of screen")
        print("Press ESC when done")
        
        # Reset global variables
        positions = []
        count = 0
        
        # Load billboard image
        billboard_cv = cv2.imread(billboard_path)
        if billboard_cv is None:
            print(f"❌ Could not load billboard image: {billboard_path}")
            return None
            
        # Create window and set mouse callback
        cv2.namedWindow('Billboard - Click Screen Corners', cv2.WINDOW_NORMAL)
        cv2.setMouseCallback('Billboard - Click Screen Corners', mouse_callback, billboard_cv)
        
        while True:
            cv2.imshow('Billboard - Click Screen Corners', billboard_cv)
            key = cv2.waitKey(20) & 0xFF
            
            if key == 27:  # ESC key
                break
            elif count >= 4:
                break
        
        cv2.destroyAllWindows()
        
        if len(positions) == 4:
            print(f"✅ Interactive corners selected: {positions}")
            return positions
        else:
            print("❌ Not enough corners selected, using predefined coordinates")
            
    # Predefined coordinates (Q's corrected values)
    predefined_corners = [
        [200, 150],   # Top-left of screen
        [800, 140],   # Top-right of screen  
        [180, 550],   # Bottom-left of screen
        [820, 560]    # Bottom-right of screen
    ]
    
    print(f"📍 Using predefined corners: {predefined_corners}")
    return predefined_corners

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
    # White pixels have RGB values close to (255, 255, 255)
    white_threshold = 240
    mask = (data[:, :, 0] < white_threshold) | \
           (data[:, :, 1] < white_threshold) | \
           (data[:, :, 2] < white_threshold)
    
    # Set alpha channel based on mask
    data[:, :, 3] = mask * 255
    
    # Convert back to PIL Image
    result = Image.fromarray(data, 'RGBA')
    
    return result

def create_aligned_billboard(figure_path, output_path):
    """Create properly aligned billboard using interactive or predefined corners"""
    
    print("🎯 ALIGNED BILLBOARD CREATION")
    
    # Step 1: Generate Funko Pop
    print("📦 Step 1: Generate Funko Pop...")
    generator = CleanFunkoPopGenerator()
    temp_funko = "simple_results/aligned_temp.jpg"
    
    success = generator.generate_funko_pop(
        figure_path,
        temp_funko
    )
    
    if not success:
        print("❌ Failed to generate Funko Pop")
        return False
    
    print("✅ Funko Pop generated")
    
    # Step 2: Cut out figure
    print("✂️ Step 2: Cut out figure...")
    figure_img = cut_out_figure(temp_funko)
    print("✅ Figure cut out")
    
    # Step 3: Get billboard corners
    print("🏙️ Step 3: Get billboard screen corners...")
    screen_corners = get_billboard_corners('thebillboard.png')
    
    if screen_corners is None:
        print("❌ Failed to get billboard corners")
        return False
    
    # Step 4: Create billboard
    print("🎨 Step 4: Create aligned billboard...")
    
    # Load billboard
    billboard = Image.open('thebillboard.png').convert("RGBA")
    bg_width, bg_height = billboard.size
    
    print(f"📐 Billboard dimensions: {bg_width}x{bg_height}")
    
    # Start with billboard as base
    result = billboard.copy()
    
    # Calculate pixel adjustments
    # 1.5cm = 1.5 * (96/2.54) ≈ 57 pixels
    # 3cm = 3 * (96/2.54) ≈ 113 pixels
    cm_to_pixels = 96 / 2.54
    figure_down_pixels = int(1.5 * cm_to_pixels)  # ~57 pixels
    text_down_pixels = int(3.0 * cm_to_pixels)    # ~113 pixels
    
    print(f"📏 Adjustments: Figure down {figure_down_pixels}px, Text down {text_down_pixels}px")
    
    # Calculate areas for figure and text based on screen corners
    # Split screen area roughly in half
    mid_x = (screen_corners[0][0] + screen_corners[1][0]) // 2
    
    # Figure area (right side) - MOVED DOWN 1.5CM
    figure_corners = [
        [mid_x, screen_corners[0][1] + figure_down_pixels],      # Top-left of right area - DOWN 1.5cm
        [screen_corners[1][0], screen_corners[1][1] + figure_down_pixels],  # Top-right - DOWN 1.5cm
        [mid_x, screen_corners[2][1]],                           # Bottom-left of right area (unchanged)
        screen_corners[3]                                        # Bottom-right of screen (unchanged)
    ]
    
    # Map figure to right side
    print("🔄 Mapping figure to right side...")
    mapped_figure = map_to_billboard_screen(figure_img, figure_corners, target_size=(400, 400))
    result = Image.alpha_composite(result, mapped_figure)
    print("✅ Figure mapped with proper perspective")
    
    # Create text content
    print("📝 Creating text content...")
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
        print("✅ AWS logo added")
        
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
    
    # Text area (left side) - MOVED DOWN 3CM
    text_corners = [
        [screen_corners[0][0], screen_corners[0][1] + text_down_pixels],  # Top-left - DOWN 3cm
        [mid_x, screen_corners[1][1] + text_down_pixels],                 # Top-right of left area - DOWN 3cm
        screen_corners[2],                                                # Bottom-left of screen (unchanged)
        [mid_x, screen_corners[3][1]]                                     # Bottom-right of left area (unchanged)
    ]
    
    # Map text to left side
    print("🔄 Mapping text to left side...")
    mapped_text = map_to_billboard_screen(text_canvas, text_corners, target_size=(600, 500))
    result = Image.alpha_composite(result, mapped_text)
    print("✅ Text mapped with proper perspective")
    
    # Save result
    final = result.convert("RGB")
    final.save(output_path, "JPEG", quality=95)
    
    # Clean up
    try:
        os.remove(temp_funko)
    except:
        pass
    
    print(f"🎉 ALIGNED BILLBOARD COMPLETE: {output_path}")
    return True

if __name__ == "__main__":
    os.makedirs('simple_results', exist_ok=True)
    
    print("🎯 INTERACTIVE BILLBOARD ALIGNMENT TOOL")
    print(f"📋 Mode: {'Interactive' if use_interactive else 'Predefined'}")
    
    success = create_aligned_billboard(
        'test/bear.PNG',
        'simple_results/aligned_billboard.jpg'
    )
    
    if success:
        print("🎉 SUCCESS! Check simple_results/aligned_billboard.jpg")
    else:
        print("❌ FAILED!")
