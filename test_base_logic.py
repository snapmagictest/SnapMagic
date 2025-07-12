#!/usr/bin/env python3
"""
Test the base establishment logic
"""

def test_override_parsing():
    """Test parsing override numbers from filenames"""
    
    test_files = [
        "cards/54.240.197.233_override1_card_1_20250712_163358.png",
        "cards/54.240.197.233_override1_card_1_20250712_163429.png", 
        "print-queue/54.240.197.233_override2_card_1_20250712_163443.png"
    ]
    
    max_override = 0
    
    for filename in test_files:
        print(f"Processing: {filename}")
        
        if '_override' in filename:
            try:
                parts = filename.split('_override')[1]
                override_num = int(parts.split('_')[0])
                max_override = max(max_override, override_num)
                print(f"  → Extracted override: {override_num}, current max: {max_override}")
            except (ValueError, IndexError) as e:
                print(f"  → Parse error: {e}")
    
    current_base = max(1, max_override)
    print(f"\n✅ Established base: override{current_base}")
    
    return current_base

if __name__ == "__main__":
    print("🧪 Testing Base Establishment Logic")
    print("=" * 50)
    
    result = test_override_parsing()
    
    print(f"\n🎯 Expected: override2 (highest from test files)")
    print(f"🎯 Actual: override{result}")
    print(f"🎯 Test {'PASSED' if result == 2 else 'FAILED'}")
