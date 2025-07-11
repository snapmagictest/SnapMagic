/**
 * Test script to verify usage count updates immediately after card generation
 * This ensures users see accurate remaining counts and don't get false impressions
 */

const API_BASE_URL = 'https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev';

async function testCountUpdate() {
    console.log('🧪 Testing Usage Count Update After Generation...');
    
    try {
        // Step 1: Login and get initial count
        console.log('\n1️⃣ Getting initial usage count...');
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
        console.log('📊 Initial count:', loginData.remaining);
        
        const token = loginData.token;
        const initialCards = loginData.remaining.cards;
        
        // Step 2: Generate a card
        console.log('\n2️⃣ Generating a card...');
        
        const cardResponse = await fetch(`${API_BASE_URL}/api/transform-card`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                action: 'transform_card',
                prompt: 'Test count update with magical wizard',
                user_name: 'CountTest'
            })
        });
        
        const cardData = await cardResponse.json();
        
        if (cardData.success) {
            console.log('✅ Card generated successfully!');
            
            // Step 3: Store the card (this should trigger count update)
            console.log('\n3️⃣ Storing card in S3...');
            
            const testFinalCard = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
            
            const storeResponse = await fetch(`${API_BASE_URL}/api/store-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'store_final_card',
                    final_card_base64: testFinalCard,
                    prompt: 'Test count update with magical wizard',
                    user_name: 'CountTest'
                })
            });
            
            const storeData = await storeResponse.json();
            
            if (storeData.success) {
                console.log('✅ Card stored successfully!');
                console.log('📁 S3 Key:', storeData.s3_key);
                
                // Step 4: Check updated count
                console.log('\n4️⃣ Checking updated usage count...');
                
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
                    console.log('✅ Updated count retrieved');
                    console.log('📊 Updated count:', loginData2.remaining);
                    
                    const finalCards = loginData2.remaining.cards;
                    const difference = initialCards - finalCards;
                    
                    console.log('\n📈 Count Analysis:');
                    console.log(`   Before generation: ${initialCards} cards`);
                    console.log(`   After generation: ${finalCards} cards`);
                    console.log(`   Difference: ${difference} card(s)`);
                    
                    if (difference === 1) {
                        console.log('✅ Count updated correctly - decreased by 1!');
                        console.log('✅ User will see accurate remaining count');
                        console.log('✅ No false impression of available cards');
                    } else if (difference === 0) {
                        console.log('❌ Count did not update - user will see false impression');
                        console.log('❌ User thinks they still have same number of cards');
                    } else {
                        console.log(`⚠️  Unexpected difference: ${difference}`);
                    }
                    
                    // Step 5: User Experience Verification
                    console.log('\n👤 User Experience:');
                    if (difference === 1) {
                        console.log('   1. User generates card → Sees card created');
                        console.log(`   2. Usage display updates → Shows ${finalCards} remaining`);
                        console.log('   3. User has accurate information → Can make informed decisions');
                        console.log('   4. No surprises or disappointment → Good UX');
                    } else {
                        console.log('   1. User generates card → Sees card created');
                        console.log(`   2. Usage display shows → Still ${initialCards} remaining (WRONG)`);
                        console.log('   3. User thinks they have more cards → False impression');
                        console.log('   4. User may be surprised later → Poor UX');
                    }
                    
                } else {
                    console.error('❌ Failed to get updated count:', loginData2.error);
                }
                
            } else {
                console.error('❌ Card storage failed:', storeData.error);
            }
            
        } else {
            console.error('❌ Card generation failed:', cardData.error);
        }
        
        console.log('\n🎉 Count update test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCountUpdate();
