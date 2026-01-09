/**
 * Upload to Cloudflare R2 using direct S3-compatible API
 */

const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

// R2 Configuration
const ACCESS_KEY = '1eff105b63bff5c4983cf71c86a944ef';
const SECRET_KEY = '4b97d5e8ce8cdee03fcccc0aa683655122c046dff7101dc9298809ccc43072a0';
const ACCOUNT_ID = '5fe0dd82b8c31e87c4b1c98dd9f89d10';
const BUCKET = 'hoops-stats';
const KEY = 'advanced-cards.json';
const FILE_PATH = './advanced-cards-updated.json';

// Read file
const fileContent = fs.readFileSync(FILE_PATH);
const fileSize = fileContent.length;

console.log(`📤 Uploading to R2: ${KEY}`);
console.log(`   Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB\n`);

// Create AWS Signature V4
function createSignature(method, key, contentType, dateStr, contentHash) {
    const region = 'auto';
    const service = 's3';
    const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;

    const canonicalRequest = [
        method,
        `/${BUCKET}/${key}`,
        '',
        `content-type:${contentType}`,
        `host:${host}`,
        `x-amz-content-sha256:${contentHash}`,
        `x-amz-date:${dateStr}`,
        '',
        'content-type;host;x-amz-content-sha256;x-amz-date',
        contentHash
    ].join('\n');

    const canonicalHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');

    const credentialScope = `${dateStr.substr(0, 8)}/${region}/${service}/aws4_request`;

    const stringToSign = [
        'AWS4-HMAC-SHA256',
        dateStr,
        credentialScope,
        canonicalHash
    ].join('\n');

    const kDate = crypto.createHmac('sha256', `AWS4${SECRET_KEY}`).update(dateStr.substr(0, 8)).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    return {
        authorization: `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=${signature}`,
        dateStr,
        contentHash
    };
}

// Upload file
function uploadToR2() {
    return new Promise((resolve, reject) => {
        const contentType = 'application/json';
        const now = new Date();
        const dateStr = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
        const contentHash = crypto.createHash('sha256').update(fileContent).digest('hex');

        const { authorization } = createSignature('PUT', KEY, contentType, dateStr, contentHash);

        const options = {
            hostname: `${ACCOUNT_ID}.r2.cloudflarestorage.com`,
            port: 443,
            path: `/${BUCKET}/${KEY}`,
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileSize,
                'Authorization': authorization,
                'x-amz-content-sha256': contentHash,
                'x-amz-date': dateStr,
                'Host': `${ACCOUNT_ID}.r2.cloudflarestorage.com`
            }
        };

        const req = https.request(options, (res) => {
            console.log(`Status: ${res.statusCode}`);

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 204) {
                    console.log('✅ Upload successful!\n');
                    resolve();
                } else {
                    console.log('Response:', data);
                    reject(new Error(`Upload failed with status ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => {
            console.error('❌ Upload error:', e.message);
            reject(e);
        });

        req.write(fileContent);
        req.end();
    });
}

// Run upload
uploadToR2()
    .then(() => {
        console.log('Next step: Reload the cache');
        console.log('curl -X POST http://localhost:8080/api/cards/advanced/cache/reload');
    })
    .catch(err => {
        console.error('Failed to upload:', err.message);
        process.exit(1);
    });
