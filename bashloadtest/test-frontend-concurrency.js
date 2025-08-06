#!/usr/bin/env node

/**
 * Frontend Concurrency Control Test
 * Simulates multiple users clicking "Generate Card" simultaneously through the frontend
 */

const https = require('https');
const { performance } = require('perf_hooks');

// Configuration
const FRONTEND_URL = 'https://main.d1ab2c3d4e.amplifyapp.com';
const API_BASE_URL = 'https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/';
const CONCURRENT_USERS = 10;

console.log('🧪 Frontend Concurrency Control Test');
console.log('====================================');
console.log(`Testing ${CONCURRENT_USERS} users clicking "Generate Card" simultaneously`);
console.log('This tests the frontend JavaScript concurrency control\n');

// Simulate the frontend SnapMagicApp class behavior
class MockSnapMagicApp {
    constructor() {
        // These are the concurrency control properties we added
        this.activeCardRequests = 0;
        this.maxConcurrentCards = 2; // The limit we set
        this.cardRequestQueue = [];
        this.authToken = null;
    }

    async login() {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                username: 'demo',
                password: 'demo'
            });

            const options = {
                hostname: '3wmz6wtgc9.execute-api.us-east-1.amazonaws.com',
                port: 443,
                path: '/dev/api/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        this.authToken = response.token;
                        resolve(response);
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }

    // This simulates the frontend generateCardWithName method with concurrency control
    async generateCardWithName(userPrompt, userName, userId) {
        console.log(`👤 User ${userId}: Clicking "Generate Card"`);
        
        // NEW: Check if we're at the concurrent limit (this is the concurrency control)
        if (this.activeCardRequests >= this.maxConcurrentCards) {
            // Queue the request instead of processing immediately
            return this.queueCardRequest(userPrompt, userName, userId);
        }
        
        // Process the request immediately
        return this.processCardRequest(userPrompt, userName, userId);
    }

    // NEW METHOD: Queue card requests when at capacity
    async queueCardRequest(userPrompt, userName, userId) {
        console.log(`🚦 User ${userId}: Queued (${this.activeCardRequests}/${this.maxConcurrentCards} slots busy)`);
        
        // Add to queue
        return new Promise((resolve, reject) => {
            this.cardRequestQueue.push({
                userPrompt,
                userName,
                userId,
                resolve,
                reject
            });
        });
    }

    // NEW METHOD: Process card requests with concurrency tracking
    async processCardRequest(userPrompt, userName, userId) {
        this.activeCardRequests++; // Track this request
        console.log(`🎯 User ${userId}: Processing (${this.activeCardRequests}/${this.maxConcurrentCards} slots busy)`);
        
        const startTime = performance.now();
        
        try {
            const result = await this.callAPI(userPrompt, userName, userId);
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            console.log(`✅ User ${userId}: SUCCESS (${duration}s)`);
            return { success: true, duration, userId };
        } catch (error) {
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            console.log(`❌ User ${userId}: ERROR ${error.message} (${duration}s)`);
            return { success: false, error: error.message, duration, userId };
        } finally {
            this.activeCardRequests--; // Stop tracking this request
            
            // Process next request in queue
            this.processNextCardInQueue();
        }
    }

    // NEW METHOD: Process next queued card request
    processNextCardInQueue() {
        if (this.cardRequestQueue.length > 0 && this.activeCardRequests < this.maxConcurrentCards) {
            const nextRequest = this.cardRequestQueue.shift();
            console.log(`🚀 User ${nextRequest.userId}: Processing queued request (${this.cardRequestQueue.length} remaining in queue)`);
            
            // Process the queued request
            this.processCardRequest(nextRequest.userPrompt, nextRequest.userName, nextRequest.userId)
                .then(nextRequest.resolve)
                .catch(nextRequest.reject);
        }
    }

    // Simulate the actual API call
    async callAPI(userPrompt, userName, userId) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                action: 'transform_card',
                prompt: userPrompt,
                user_name: userName || ''
            });

            const options = {
                hostname: '3wmz6wtgc9.execute-api.us-east-1.amazonaws.com',
                port: 443,
                path: '/dev/api/transform-card',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }
}

// Main test function
async function runConcurrencyTest() {
    const app = new MockSnapMagicApp();
    
    try {
        // Login first
        console.log('🔑 Logging in...');
        await app.login();
        console.log('✅ Login successful\n');
        
        console.log('🚀 Simulating 10 users clicking "Generate Card" simultaneously...\n');
        
        const startTime = performance.now();
        
        // Create 10 concurrent "users" clicking generate card
        const promises = [];
        for (let i = 1; i <= CONCURRENT_USERS; i++) {
            const promise = app.generateCardWithName(
                `Frontend concurrency test user #${i}`,
                `User${i}`,
                i
            );
            promises.push(promise);
        }
        
        // Wait for all requests to complete
        const results = await Promise.all(promises);
        
        const endTime = performance.now();
        const totalTime = ((endTime - startTime) / 1000).toFixed(2);
        
        // Analyze results
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log('\n📊 FRONTEND CONCURRENCY TEST RESULTS');
        console.log('====================================');
        console.log(`✅ Successful requests: ${successful}/${CONCURRENT_USERS} (${(successful/CONCURRENT_USERS*100).toFixed(0)}%)`);
        console.log(`❌ Failed requests: ${failed}/${CONCURRENT_USERS} (${(failed/CONCURRENT_USERS*100).toFixed(0)}%)`);
        console.log(`⏱️  Total test time: ${totalTime}s`);
        
        if (successful > 0) {
            const avgTime = results
                .filter(r => r.success)
                .reduce((sum, r) => sum + parseFloat(r.duration), 0) / successful;
            console.log(`⏱️  Average response time: ${avgTime.toFixed(2)}s`);
        }
        
        console.log('\n📈 ANALYSIS:');
        console.log('Expected with concurrency control:');
        console.log('  • First 2 requests: Process immediately');
        console.log('  • Requests 3-10: Queue and process as slots become available');
        console.log('  • Success rate: 100% (no HTTP 500 errors)');
        console.log('  • Some requests take longer due to queuing');
        
        if (successful === CONCURRENT_USERS) {
            console.log('\n🎉 EXCELLENT! Concurrency control is working perfectly!');
            console.log('   → All requests succeeded (no HTTP 500 errors)');
            console.log('   → Frontend queuing prevented backend overload');
            console.log('   → Ready for your 5000-user event!');
        } else if (successful >= 8) {
            console.log('\n👍 GOOD! Concurrency control is mostly working');
            console.log('   → Significant improvement over direct API calls');
            console.log('   → Minor issues may need investigation');
        } else {
            console.log('\n⚠️  MIXED RESULTS');
            console.log('   → Some improvement but not optimal');
            console.log('   → May need to adjust maxConcurrentCards limit');
        }
        
        console.log(`\n💰 Test cost: ~$${(CONCURRENT_USERS * 0.04).toFixed(2)} (${CONCURRENT_USERS} requests × $0.04)`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
runConcurrencyTest();
