/**
 * Test script to verify IP-based usage tracking system
 */

const API_BASE_URL = 'https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev';

async function testIPTracking() {
    console.log('🧪 Testing IP-based Usage Tracking System...');
    
    try {
        // Step 1: Login and check initial usage
        console.log('\n1️⃣ Testing login with usage info...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'demo',
                password: 'demo'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (!loginData.success) {
            throw new Error(`Login failed: ${loginData.error}`);
        }
        
        console.log('✅ Login successful');
        console.log('📊 Initial usage:', loginData.remaining);
        console.log('🌐 Client IP:', loginData.client_ip);
        
        const token = loginData.token;
        const initialRemaining = loginData.remaining;
        
        // Step 2: Generate a card and check usage update
        console.log('\n2️⃣ Testing card generation with IP tracking...');
        
        const cardResponse = await fetch(`${API_BASE_URL}/api/transform-card`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                action: 'transform_card',
                prompt: 'Test IP tracking system with steampunk robot',
                user_name: 'IPTest'
            })
        });
        
        const cardData = await cardResponse.json();
        
        if (cardData.success) {
            console.log('✅ Card generated successfully!');
            console.log('📊 Updated usage:', cardData.remaining);
            console.log('🌐 Client IP:', cardData.client_ip);
            
            // Verify usage decreased
            if (cardData.remaining.cards < initialRemaining.cards) {
                console.log('✅ Usage tracking working - cards remaining decreased!');
            } else {
                console.log('❌ Usage tracking issue - cards remaining did not decrease');
            }
        } else {
            console.error('❌ Card generation failed:', cardData.error);
        }
        
        // Step 3: Test login again to verify persistence
        console.log('\n3️⃣ Testing login again to verify usage persistence...');
        
        const loginResponse2 = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'demo',
                password: 'demo'
            })
        });
        
        const loginData2 = await loginResponse2.json();
        
        if (loginData2.success) {
            console.log('✅ Second login successful');
            console.log('📊 Persistent usage:', loginData2.remaining);
            
            // Verify usage persisted
            if (loginData2.remaining.cards === cardData.remaining.cards) {
                console.log('✅ Usage persistence working - same remaining count!');
            } else {
                console.log('❌ Usage persistence issue - counts do not match');
            }
        }
        
        console.log('\n🎉 IP-based tracking test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testIPTracking();
