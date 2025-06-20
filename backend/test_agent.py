#!/usr/bin/env python3
"""
Test script for SnapMagic AI agent
Use this to test the Strands Agents integration locally
"""

import sys
import os
import logging

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

def test_agent():
    """Test the SnapMagic agent with sample queries"""
    try:
        from src.snapmagic_tools import create_snapmagic_agent
        
        print("🧪 Testing SnapMagic AI Agent...")
        print("=" * 50)
        
        # Create agent
        agent = create_snapmagic_agent()
        print("✅ Agent created successfully")
        
        # Test queries
        test_queries = [
            "Hello! Can you tell me about your capabilities?",
            "What AI tools do you have available?",
            "How can you help with image transformation?",
        ]
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n🔍 Test {i}: {query}")
            print("-" * 30)
            
            try:
                result = agent(query)
                print(f"✅ Response: {result.message}")
            except Exception as e:
                print(f"❌ Error: {str(e)}")
        
        print("\n" + "=" * 50)
        print("🎉 Agent testing completed!")
        
    except Exception as e:
        print(f"❌ Agent test failed: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_agent()
    sys.exit(0 if success else 1)
