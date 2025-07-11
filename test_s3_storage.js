/**
 * Test script to verify S3 card storage functionality
 */

const API_BASE_URL = 'https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev';

async function testS3Storage() {
    console.log('🧪 Testing S3 Card Storage...');
    
    try {
        // Step 1: Login to get a valid token
        console.log('1️⃣ Logging in...');
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
        const token = loginData.token;
        
        // Step 2: Test store-card endpoint
        console.log('2️⃣ Testing store-card endpoint...');
        
        // Create a simple 1x1 pixel PNG in base64
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        
        const storeResponse = await fetch(`${API_BASE_URL}/api/store-card`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                action: 'store_final_card',
                final_card_base64: testImageBase64,
                prompt: 'Test card storage functionality',
                user_name: 'TestUser'
            })
        });
        
        const storeData = await storeResponse.json();
        
        if (storeData.success) {
            console.log('✅ Card stored successfully!');
            console.log('📁 S3 Key:', storeData.s3_key);
            console.log('🔗 S3 URL:', storeData.s3_url);
        } else {
            console.error('❌ Store failed:', storeData.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testS3Storage();
