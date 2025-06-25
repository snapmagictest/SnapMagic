#!/usr/bin/env python3
from PIL import Image, ImageDraw

def create_exact_coordinate_mask():
    """Create mask using your exact coordinates"""
    
    # Card dimensions
    CARD_WIDTH = 686
    CARD_HEIGHT = 1024
    
    # Your exact placeholder coordinates
    PLACEHOLDER_X = 69      # Left edge
    PLACEHOLDER_Y = 78      # Top edge
    PLACEHOLDER_WIDTH = 549 # 618 - 69 = 549
    PLACEHOLDER_HEIGHT = 492 # 570 - 78 = 492
    
    # Create white mask image (preserve everything)
    mask = Image.new('L', (CARD_WIDTH, CARD_HEIGHT), 255)  # White = preserve
    
    # Draw black rectangle at exact coordinates (replace this area only)
    draw = ImageDraw.Draw(mask)
    draw.rectangle([
        PLACEHOLDER_X, 
        PLACEHOLDER_Y, 
        PLACEHOLDER_X + PLACEHOLDER_WIDTH, 
        PLACEHOLDER_Y + PLACEHOLDER_HEIGHT
    ], fill=0)  # Black = replace
    
    # Save the mask
    mask.save('exact_mask.png')
    
    print("✅ EXACT coordinate mask created: exact_mask.png")
    print(f"📐 Card: {CARD_WIDTH} x {CARD_HEIGHT}")
    print(f"📍 Placeholder: X={PLACEHOLDER_X}, Y={PLACEHOLDER_Y}")
    print(f"📏 Size: {PLACEHOLDER_WIDTH} x {PLACEHOLDER_HEIGHT}")
    print("🎯 This should be pixel-perfect!")
    
    return 'exact_mask.png'

if __name__ == "__main__":
    create_exact_coordinate_mask()
