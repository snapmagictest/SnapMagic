#!/usr/bin/env node

/**
 * 10 Separate Browsers Test
 * Simulates 10 different users in 10 different browsers
 * Each browser has its own independent frontend concurrency control
 */

const https = require('https');
const { performance } = require('perf_hooks');

// Configuration
const CONCURRENT_BROWSERS = 10;

console.log('🧪 10 Separate Browsers Test');
console.log('============================');
console.log('Simulating 10 different users in 10 different browsers');
console.log('Each browser has independent frontend concurrency control');
console.log('This shows real-world multi-user behavior\n');

// Simulate separate browser instances
class SeparateBrowserInstance {
    constructor(browserId) {
        this.browserId = browserId;
        // Each browser has its own independent concurrency control
        this.activeCardRequests = 0;
        this.maxConcurrentCards = 2; // Each browser thinks it can do 2
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

    // Each browser has its own generateCardWithName method
    async generateCardWithName(userPrompt, userName) {
        console.log(`👤 Browser ${this.browserId}: User clicking "Generate Card"`);
        
        // Each browser checks its OWN concurrency limit
        if (this.activeCardRequests >= this.maxConcurrentCards) {
            return this.queueCardRequest(userPrompt, userName);
        }
        
        return this.processCardRequest(userPrompt, userName);
    }

    async queueCardRequest(userPrompt, userName) {
        console.log(`🚦 Browser ${this.browserId}: Request queued (${this.activeCardRequests}/${this.maxConcurrentCards} slots busy in THIS browser)`);
        
        return new Promise((resolve, reject) => {
            this.cardRequestQueue.push({
                userPrompt,
                userName,
                resolve,
                reject
            });
        });
    }

    async processCardRequest(userPrompt, userName) {
        this.activeCardRequests++; // Each browser tracks its own
        console.log(`🎯 Browser ${this.browserId}: Processing (${this.activeCardRequests}/${this.maxConcurrentCards} slots busy in THIS browser)`);
        
        const startTime = performance.now();
        
        try {
            const result = await this.callAPI(userPrompt, userName);
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            console.log(`✅ Browser ${this.browserId}: SUCCESS (${duration}s)`);
            return { success: true, duration, browserId: this.browserId };
        } catch (error) {
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            console.log(`❌ Browser ${this.browserId}: ERROR ${error.message} (${duration}s)`);
            return { success: false, error: error.message, duration, browserId: this.browserId };
        } finally {
            this.activeCardRequests--;
            this.processNextCardInQueue();
        }
    }

    processNextCardInQueue() {
        if (this.cardRequestQueue.length > 0 && this.activeCardRequests < this.maxConcurrentCards) {
            const nextRequest = this.cardRequestQueue.shift();
            console.log(`🚀 Browser ${this.browserId}: Processing queued request`);
            
            this.processCardRequest(nextRequest.userPrompt, nextRequest.userName)
                .then(nextRequest.resolve)
                .catch(nextRequest.reject);
        }
    }

    async callAPI(userPrompt, userName) {
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
async function runSeparateBrowsersTest() {
    console.log('🔑 Creating 10 separate browser instances and logging in...\n');
    
    // Create 10 separate browser instances
    const browsers = [];
    for (let i = 1; i <= CONCURRENT_BROWSERS; i++) {
        const browser = new SeparateBrowserInstance(i);
        await browser.login();
        browsers.push(browser);
        console.log(`✅ Browser ${i}: Logged in`);
    }
    
    console.log('\n🚀 10 users in 10 different browsers clicking "Generate Card" simultaneously...\n');
    
    const startTime = performance.now();
    
    // Each browser makes 1 request simultaneously
    const promises = browsers.map((browser, index) => {
        return browser.generateCardWithName(
            `Separate browser test from Browser ${browser.browserId}`,
            `User${browser.browserId}`
        );
    });
    
    // Wait for all requests to complete
    const results = await Promise.all(promises);
    
    const endTime = performance.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    
    // Analyze results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n📊 SEPARATE BROWSERS TEST RESULTS');
    console.log('==================================');
    console.log(`✅ Successful requests: ${successful}/${CONCURRENT_BROWSERS} (${(successful/CONCURRENT_BROWSERS*100).toFixed(0)}%)`);
    console.log(`❌ Failed requests: ${failed}/${CONCURRENT_BROWSERS} (${(failed/CONCURRENT_BROWSERS*100).toFixed(0)}%)`);
    console.log(`⏱️  Total test time: ${totalTime}s`);
    
    if (successful > 0) {
        const avgTime = results
            .filter(r => r.success)
            .reduce((sum, r) => sum + parseFloat(r.duration), 0) / successful;
        console.log(`⏱️  Average response time: ${avgTime.toFixed(2)}s`);
    }
    
    console.log('\n📈 ANALYSIS:');
    console.log('Expected with separate browsers:');
    console.log('  • Each browser thinks it can send 2 requests');
    console.log('  • 10 browsers × 1 request each = 10 concurrent requests to backend');
    console.log('  • Backend still gets overwhelmed (same as direct API test)');
    console.log('  • Should see ~6 successes, 4 failures (same as direct API)');
    
    console.log('\n📊 COMPARISON:');
    console.log(`Direct API test:     6/10 succeeded (60%)`);
    console.log(`Single frontend:     10/10 succeeded (100%)`);
    console.log(`Separate browsers:   ${successful}/10 succeeded (${(successful/CONCURRENT_BROWSERS*100).toFixed(0)}%)`);
    
    if (successful <= 6) {
        console.log('\n🎯 CONFIRMED: Frontend concurrency control is useless!');
        console.log('   → Each browser has independent concurrency control');
        console.log('   → No coordination between browsers');
        console.log('   → Backend still gets overwhelmed');
        console.log('   → Same failure rate as direct API calls');
    } else if (successful >= 9) {
        console.log('\n🤔 UNEXPECTED: Better results than expected');
        console.log('   → Backend might have improved');
        console.log('   → Or test timing was lucky');
    } else {
        console.log('\n📊 MIXED RESULTS: Some improvement but not perfect');
        console.log('   → Partial benefit from reduced concurrency per browser');
        console.log('   → But still not reliable for production');
    }
    
    console.log(`\n💰 Test cost: ~$${(CONCURRENT_BROWSERS * 0.04).toFixed(2)} (${CONCURRENT_BROWSERS} requests × $0.04)`);
}

// Run the test
runSeparateBrowsersTest().catch(console.error);
