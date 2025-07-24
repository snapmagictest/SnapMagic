#!/usr/bin/env python3
"""
Quick SnapMagic Template Test
Tests template generation and provides feedback without base64 bloat
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = "https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod"
USERNAME = "demo"
PASSWORD = "snapmagic2024"

class TemplateQuickTest:
    def __init__(self):
        self.token = None
        self.session = requests.Session()
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def login(self):
        """Login and get JWT token"""
        try:
            response = self.session.post(f"{API_BASE_URL}/login", json={
                "username": USERNAME,
                "password": PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                self.log("✅ Login successful", "SUCCESS")
                return True
            else:
                self.log(f"❌ Login failed: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Login error: {str(e)}", "ERROR")
            return False
    
    def test_card_generation(self, prompt, test_name):
        """Test card generation with specific prompt"""
        self.log(f"🧪 Testing: {test_name}", "TEST")
        
        try:
            start_time = time.time()
            
            response = self.session.post(f"{API_BASE_URL}/generate-card", json={
                "prompt": prompt,
                "creator_name": "Test User",
                "creator_title": "Template Tester",
                "event_name": "Template Test Event"
            })
            
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure without printing base64
                has_image = 'image' in data and len(data.get('image', '')) > 100
                has_metadata = 'metadata' in data
                
                self.log(f"✅ {test_name} - Generated in {duration:.1f}s", "SUCCESS")
                self.log(f"   📊 Has image: {has_image}", "INFO")
                self.log(f"   📊 Has metadata: {has_metadata}", "INFO")
                
                if has_metadata:
                    metadata = data['metadata']
                    self.log(f"   📊 Dimensions: {metadata.get('width', 'N/A')}x{metadata.get('height', 'N/A')}", "INFO")
                    self.log(f"   📊 Format: {metadata.get('format', 'N/A')}", "INFO")
                
                return True
                
            else:
                self.log(f"❌ {test_name} - Failed: {response.status_code}", "ERROR")
                try:
                    error_data = response.json()
                    self.log(f"   Error: {error_data.get('error', 'Unknown error')}", "ERROR")
                except:
                    self.log(f"   Raw error: {response.text[:200]}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ {test_name} - Exception: {str(e)}", "ERROR")
            return False
    
    def test_template_scenarios(self):
        """Test various template scenarios"""
        test_cases = [
            {
                "prompt": "AWS Lambda function powering serverless architecture",
                "name": "Standard AWS Prompt"
            },
            {
                "prompt": "Cloud architect designing the future",
                "name": "Simple Creative Prompt"
            },
            {
                "prompt": "DevOps engineer automating everything with CDK",
                "name": "Technical Prompt"
            },
            {
                "prompt": "AI",
                "name": "Minimal Prompt"
            },
            {
                "prompt": "Senior Principal Distinguished Cloud Solutions Architect building enterprise-scale multi-cloud infrastructure with advanced security, compliance, and governance frameworks",
                "name": "Very Long Prompt"
            }
        ]
        
        results = []
        for test_case in test_cases:
            success = self.test_card_generation(test_case["prompt"], test_case["name"])
            results.append({"name": test_case["name"], "success": success})
            time.sleep(1)  # Rate limiting
        
        return results
    
    def run_quick_test(self):
        """Run the complete quick test suite"""
        self.log("🚀 Starting SnapMagic Template Quick Test", "START")
        self.log("=" * 50)
        
        # Step 1: Login
        if not self.login():
            self.log("❌ Cannot proceed without login", "FATAL")
            return False
        
        # Step 2: Test template scenarios
        self.log("🧪 Running template generation tests...")
        results = self.test_template_scenarios()
        
        # Step 3: Summary
        self.log("=" * 50)
        self.log("📊 TEST SUMMARY", "SUMMARY")
        
        successful = sum(1 for r in results if r["success"])
        total = len(results)
        
        self.log(f"✅ Successful: {successful}/{total}", "SUMMARY")
        self.log(f"❌ Failed: {total - successful}/{total}", "SUMMARY")
        
        if successful == total:
            self.log("🎉 ALL TESTS PASSED - Template system working correctly!", "SUCCESS")
        elif successful > 0:
            self.log("⚠️  PARTIAL SUCCESS - Some issues detected", "WARNING")
        else:
            self.log("💥 ALL TESTS FAILED - Template system has issues", "ERROR")
        
        # Step 4: Specific feedback
        self.log("=" * 50)
        self.log("🔍 SPECIFIC FEEDBACK", "FEEDBACK")
        
        for result in results:
            status = "✅" if result["success"] else "❌"
            self.log(f"{status} {result['name']}", "FEEDBACK")
        
        return successful == total

def main():
    """Main test execution"""
    print("🎴 SnapMagic Template Quick Test")
    print("=" * 50)
    print("This test will:")
    print("1. Login to your SnapMagic API")
    print("2. Test card generation with various prompts")
    print("3. Provide feedback WITHOUT showing base64 data")
    print("4. Give you a quick pass/fail summary")
    print()
    
    # Get API URL from user
    global API_BASE_URL
    api_url = input(f"Enter your API Gateway URL (or press Enter for default): ").strip()
    if api_url:
        API_BASE_URL = api_url.rstrip('/')
    
    print(f"Using API: {API_BASE_URL}")
    print()
    
    # Run the test
    tester = TemplateQuickTest()
    success = tester.run_quick_test()
    
    print()
    print("=" * 50)
    if success:
        print("🎉 Template system is working correctly!")
        print("✅ You can proceed with confidence")
    else:
        print("⚠️  Template system has issues")
        print("🔧 Check the logs above for specific problems")
    
    print()
    print("💡 For visual testing, open: frontend/public/quick-template-test.html")

if __name__ == "__main__":
    main()
