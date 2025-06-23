#!/usr/bin/env python3
"""
SIMPLE SOLUTION
===============

1. Use deployer.py to get Funko Pop figures
2. Cut out the figure (remove background)
3. Put it in thebillboard.png

Simple as that.
"""

import os
from PIL import Image, ImageFilter, ImageDraw, ImageFont
import numpy as np
from deployer import CleanFunkoPopGenerator

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
    """Put figure in thebillboard.png + ADD AWS LOGO AND TEXT ON OTHER SIDE"""
    
    # Load billboard
    billboard = Image.open('thebillboard.png').convert("RGBA")
    
    # Calculate SIMPLE SOLUTION size + 2cm
    bg_width, bg_height = billboard.size
    
    # Calculate 2cm in pixels (assuming 96 DPI)
    cm_to_pixels = 96 / 2.54  # 96 DPI conversion
    additional_pixels = int(2 * cm_to_pixels)  # ~75 pixels
    
    # Original simple solution scale
    original_scale = 0.35
    original_width = int(bg_width * original_scale)
    
    # Add 2cm (75 pixels) to the width
    new_width = original_width + additional_pixels
    
    # Calculate new scale factor
    scale_factor = new_width / bg_width
    
    print(f"📏 Original simple scale: {original_scale:.2f} ({original_width}px)")
    print(f"📏 Adding 2cm: +{additional_pixels}px")
    print(f"📏 New scale: {scale_factor:.2f} ({new_width}px)")
    
    aspect_ratio = figure_img.size[1] / figure_img.size[0]
    new_height = int(new_width * aspect_ratio)
    
    # Resize figure
    scaled_figure = figure_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Position in billboard screen - MOVED UP 0.5CM
    # Calculate 0.5cm in pixels
    move_up_pixels = int(0.5 * cm_to_pixels)  # ~19 pixels
    
    x_pos = int(bg_width * 0.65 - new_width // 2)
    y_pos = int(bg_height * 0.45 - new_height // 2) - move_up_pixels  # MOVED UP 0.5CM
    
    print(f"📍 Position: ({x_pos}, {y_pos}) - moved up {move_up_pixels}px (0.5cm)")
    
    # Composite figure
    result = billboard.copy()
    result.paste(scaled_figure, (x_pos, y_pos), scaled_figure)
    
    # ADD AWS LOGO AND TEXT ON OTHER SIDE OF BILLBOARD
    print("📝 Adding AWS logo and text to other side of billboard...")
    
    # Load AWS logo
    try:
        aws_logo = Image.open('awslogo.png').convert("RGBA")
        
        # Scale AWS logo for billboard (smaller than figure)
        logo_scale = 0.15  # 15% of billboard width
        logo_width = int(bg_width * logo_scale)
        logo_aspect = aws_logo.size[1] / aws_logo.size[0]
        logo_height = int(logo_width * logo_aspect)
        
        scaled_logo = aws_logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        
        # Position logo on left side of billboard
        logo_x = int(bg_width * 0.25 - logo_width // 2)  # 25% from left (other side)
        logo_y = int(bg_height * 0.35 - logo_height // 2)  # Upper area
        
        result.paste(scaled_logo, (logo_x, logo_y), scaled_logo)
        print(f"✅ AWS logo positioned at ({logo_x}, {logo_y})")
        
    except Exception as e:
        print(f"⚠️ AWS logo not found: {e}")
        logo_y = int(bg_height * 0.35)  # Use this for text positioning
    
    # Add text with tech font
    draw = ImageDraw.Draw(result)
    
    # Try to use a tech/computer font, fallback to default
    try:
        # Try common tech fonts
        font_paths = [
            "/System/Library/Fonts/Monaco.ttc",  # macOS
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",  # Linux
            "C:/Windows/Fonts/consola.ttf",  # Windows Consolas
            "C:/Windows/Fonts/arial.ttf",  # Windows Arial fallback
        ]
        
        font_large = None
        font_medium = None
        
        for font_path in font_paths:
            try:
                if os.path.exists(font_path):
                    font_large = ImageFont.truetype(font_path, 60)  # Large for JOHANNESBURG
                    font_medium = ImageFont.truetype(font_path, 50)  # Medium for SUMMIT 2025
                    print(f"✅ Using font: {font_path}")
                    break
            except:
                continue
        
        # Fallback to default font if no custom font found
        if not font_large:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            print("⚠️ Using default font")
        
    except Exception as e:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        print(f"⚠️ Font loading failed, using default: {e}")
    
    # Text positioning (left side of billboard)
    text_x = int(bg_width * 0.25)  # 25% from left (centered on left side)
    
    # Position text below logo
    johannesburg_y = logo_y + 80  # Below logo
    summit_y = johannesburg_y + 80  # Below JOHANNESBURG
    
    # Text styling - white with black outline for visibility
    text_color = (255, 255, 255)  # White
    outline_color = (0, 0, 0)  # Black outline
    
    # Draw JOHANNESBURG with outline
    johannesburg_text = "JOHANNESBURG"
    
    # Get text size for centering
    bbox = draw.textbbox((0, 0), johannesburg_text, font=font_large)
    text_width = bbox[2] - bbox[0]
    johannesburg_x = text_x - text_width // 2
    
    # Draw outline (black)
    for dx in [-2, -1, 0, 1, 2]:
        for dy in [-2, -1, 0, 1, 2]:
            if dx != 0 or dy != 0:
                draw.text((johannesburg_x + dx, johannesburg_y + dy), johannesburg_text, 
                         font=font_large, fill=outline_color)
    
    # Draw main text (white)
    draw.text((johannesburg_x, johannesburg_y), johannesburg_text, 
             font=font_large, fill=text_color)
    
    # Draw SUMMIT 2025 with outline
    summit_text = "SUMMIT 2025"
    
    # Get text size for centering
    bbox = draw.textbbox((0, 0), summit_text, font=font_medium)
    text_width = bbox[2] - bbox[0]
    summit_x = text_x - text_width // 2
    
    # Draw outline (black)
    for dx in [-2, -1, 0, 1, 2]:
        for dy in [-2, -1, 0, 1, 2]:
            if dx != 0 or dy != 0:
                draw.text((summit_x + dx, summit_y + dy), summit_text, 
                         font=font_medium, fill=outline_color)
    
    # Draw main text (white)
    draw.text((summit_x, summit_y), summit_text, 
             font=font_medium, fill=text_color)
    
    print(f"✅ Text added: JOHANNESBURG at ({johannesburg_x}, {johannesburg_y})")
    print(f"✅ Text added: SUMMIT 2025 at ({summit_x}, {summit_y})")
    
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
