#!/usr/bin/env python3
"""
Load Test Runner - Execute Phase 1 and Phase 2 tests
"""

import subprocess
import sys
import time
from datetime import datetime

def run_phase(phase_script, phase_name):
    """Run a specific phase test"""
    print(f"\n🚀 STARTING {phase_name}")
    print(f"{'='*60}")
    print(f"Script: {phase_script}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run([sys.executable, phase_script], 
                              capture_output=False, 
                              text=True, 
                              cwd='/mnt/d/Users/mrnaidoo/PythonProjects/SnapMagic/backendloadtest')
        
        if result.returncode == 0:
            print(f"\n✅ {phase_name} completed successfully")
            return True
        else:
            print(f"\n❌ {phase_name} failed with return code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error running {phase_name}: {e}")
        return False

def main():
    """Run complete load test suite"""
    print(f"""
🎯 SNAPMAGIC LOAD TEST SUITE
============================
Phase 1: Mock Load Test (Infrastructure scaling, no Bedrock costs)
Phase 2: Real Load Test (End-to-end with Bedrock, cost-controlled)

Target: Production environment
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
""")
    
    # Ask user which phases to run
    print("Which phases would you like to run?")
    print("1. Phase 1 only (Mock load test - FREE)")
    print("2. Phase 2 only (Real load test - COSTS MONEY)")
    print("3. Both phases (Recommended)")
    print("4. Exit")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == "4":
        print("Exiting...")
        return
    
    phases_to_run = []
    
    if choice == "1":
        phases_to_run = [("phase1_mock_load.py", "PHASE 1: MOCK LOAD TEST")]
    elif choice == "2":
        phases_to_run = [("phase2_real_load.py", "PHASE 2: REAL LOAD TEST")]
    elif choice == "3":
        phases_to_run = [
            ("phase1_mock_load.py", "PHASE 1: MOCK LOAD TEST"),
            ("phase2_real_load.py", "PHASE 2: REAL LOAD TEST")
        ]
    else:
        print("Invalid choice. Exiting...")
        return
    
    # Run selected phases
    results = []
    start_time = time.time()
    
    for script, name in phases_to_run:
        success = run_phase(script, name)
        results.append((name, success))
        
        # Pause between phases
        if len(phases_to_run) > 1 and script == "phase1_mock_load.py":
            print(f"\n⏳ Pausing 2 minutes between phases...")
            time.sleep(120)
    
    total_time = time.time() - start_time
    
    # Final summary
    print(f"\n" + "="*80)
    print(f"🏁 LOAD TEST SUITE COMPLETE")
    print(f"="*80)
    print(f"Total runtime: {total_time/60:.1f} minutes")
    print(f"")
    
    for name, success in results:
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{name}: {status}")
    
    print(f"\n📊 NEXT STEPS:")
    if all(success for _, success in results):
        print("✅ All tests completed successfully")
        print("📈 Review results above for scaling insights")
        print("🔮 Use data to project 10K user performance")
    else:
        print("⚠️  Some tests failed - review logs above")
        print("🔧 Fix issues before production deployment")
    
    print(f"="*80)

if __name__ == "__main__":
    main()
