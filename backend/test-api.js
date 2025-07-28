const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Testing Attribution Guard Scanner API...\n');

    try {
        // 1. Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.status);
        console.log();

        // 2. Create test file
        console.log('2. Creating test URLs file...');
        const testUrls = [
            'https://google.com',
            'https://example.com',
            'https://github.com'
        ].join('\n');
        
        fs.writeFileSync('test_urls.txt', testUrls);
        console.log('✅ Test file created with 3 URLs');
        console.log();

        // 3. Upload and start scan
        console.log('3. Uploading file and starting scan...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream('test_urls.txt'));
        
        const scanResponse = await fetch(`${API_BASE}/api/scan`, {
            method: 'POST',
            body: formData
        });
        
        const scanData = await scanResponse.json();
        console.log('✅ Scan initiated:', scanData);
        console.log();

        const scanId = scanData.scanId;

        // 4. Monitor progress
        console.log('4. Monitoring scan progress...');
        let status = 'pending';
        let attempts = 0;
        const maxAttempts = 30; // 5 minutes maximum

        while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            
            const progressResponse = await fetch(`${API_BASE}/api/scan/${scanId}/progress`);
            const progressData = await progressResponse.json();
            
            status = progressData.status;
            attempts++;
            
            console.log(`   📊 Status: ${status} (attempt ${attempts}/${maxAttempts})`);
        }

        // 5. Get final details
        console.log('\n5. Getting scan details...');
        const detailsResponse = await fetch(`${API_BASE}/api/scan/${scanId}/details`);
        const detailsData = await detailsResponse.json();
        console.log('✅ Scan details:', detailsData);

        // 6. Download report if completed
        if (status === 'completed') {
            console.log('\n6. Downloading report...');
            const reportResponse = await fetch(`${API_BASE}/api/scan/${scanId}/report`);
            
            if (reportResponse.ok) {
                const reportData = await reportResponse.text();
                console.log('✅ Report downloaded:');
                console.log(reportData);
            } else {
                console.log('❌ Failed to download report');
            }
        } else {
            console.log('\n❌ Scan did not complete successfully');
        }

        // Cleanup
        fs.unlinkSync('test_urls.txt');
        console.log('\n🧹 Cleanup completed');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    testAPI();
}

module.exports = testAPI;