#!/usr/bin/env python3
"""
Billboard Coordinate Collection Tool
===================================

Run this script locally on your machine to:
1. Click the 4 corners of the billboard screen
2. Get the exact coordinates you want
3. Copy the coordinates back to use in the alignment

Instructions:
1. Run: python get_coordinates.py
2. Click the 4 corners in order: top-left, top-right, bottom-left, bottom-right
3. Press ESC when done
4. Copy the printed coordinates
"""

import cv2
import numpy as np

# Global variables
positions = []
count = 0

def mouse_callback(event, x, y, flags, param):
    """Mouse callback function for corner selection"""
    global positions, count
    
    if event == cv2.EVENT_LBUTTONUP:
        cv2.circle(param, (x, y), 8, (0, 255, 0), -1)  # Green circle
        positions.append([x, y])
        count += 1
        
        # Show instructions
        if count == 1:
            print(f"✅ 1. TOP-LEFT corner selected: ({x}, {y})")
            print("👆 Now click: 2. TOP-RIGHT corner of billboard screen")
        elif count == 2:
            print(f"✅ 2. TOP-RIGHT corner selected: ({x}, {y})")
            print("👆 Now click: 3. BOTTOM-LEFT corner of billboard screen")
        elif count == 3:
            print(f"✅ 3. BOTTOM-LEFT corner selected: ({x}, {y})")
            print("👆 Now click: 4. BOTTOM-RIGHT corner of billboard screen")
        elif count == 4:
            print(f"✅ 4. BOTTOM-RIGHT corner selected: ({x}, {y})")
            print("🎉 All corners selected! Press ESC to finish...")
            
            # Draw lines connecting the corners
            if len(positions) == 4:
                pts = np.array(positions, np.int32)
                pts = pts.reshape((-1, 1, 2))
                cv2.polylines(param, [pts], True, (255, 0, 0), 2)  # Blue outline

def main():
    global positions, count
    
    print("🎯 BILLBOARD COORDINATE COLLECTION TOOL")
    print("=" * 50)
    print("📋 Instructions:")
    print("   1. Click TOP-LEFT corner of billboard screen")
    print("   2. Click TOP-RIGHT corner of billboard screen") 
    print("   3. Click BOTTOM-LEFT corner of billboard screen")
    print("   4. Click BOTTOM-RIGHT corner of billboard screen")
    print("   5. Press ESC when done")
    print("=" * 50)
    
    # Reset variables
    positions = []
    count = 0
    
    # Load billboard image
    billboard_path = 'thebillboard.png'
    billboard_cv = cv2.imread(billboard_path)
    
    if billboard_cv is None:
        print(f"❌ Could not load billboard image: {billboard_path}")
        print("Make sure thebillboard.png is in the current directory")
        return
    
    print(f"✅ Loaded billboard image: {billboard_path}")
    print("👆 Click the first corner: TOP-LEFT of billboard screen")
    
    # Create window and set mouse callback
    cv2.namedWindow('Billboard - Click Screen Corners', cv2.WINDOW_NORMAL)
    cv2.resizeWindow('Billboard - Click Screen Corners', 800, 600)
    cv2.setMouseCallback('Billboard - Click Screen Corners', mouse_callback, billboard_cv)
    
    while True:
        cv2.imshow('Billboard - Click Screen Corners', billboard_cv)
        key = cv2.waitKey(20) & 0xFF
        
        if key == 27:  # ESC key
            break
        elif count >= 4:
            # Show final result for a moment
            cv2.waitKey(1000)
            break
    
    cv2.destroyAllWindows()
    
    # Print results
    print("\n" + "=" * 50)
    print("🎉 COORDINATE COLLECTION COMPLETE!")
    print("=" * 50)
    
    if len(positions) == 4:
        print("✅ All 4 corners collected:")
        print(f"   1. Top-left:     {positions[0]}")
        print(f"   2. Top-right:    {positions[1]}")
        print(f"   3. Bottom-left:  {positions[2]}")
        print(f"   4. Bottom-right: {positions[3]}")
        print("\n📋 COPY THIS FOR ALIGNMENT:")
        print("=" * 30)
        print(f"screen_corners = {positions}")
        print("=" * 30)
        print("\n💡 Copy the screen_corners line above and use it in the alignment tool!")
    else:
        print(f"❌ Only {len(positions)} corners selected. Need 4 corners.")
        print("Run the script again and click all 4 corners.")
    
    print("\n🔄 To run again: python get_coordinates.py")

if __name__ == "__main__":
    main()
