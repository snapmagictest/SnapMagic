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
from PIL import Image, ImageFilter
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
    """Put figure in thebillboard.png - SIMPLE SOLUTION SIZE + 2CM, MOVED UP 0.5CM"""
    
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
    
    # Composite
    result = billboard.copy()
    result.paste(scaled_figure, (x_pos, y_pos), scaled_figure)
    
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
