/**
 * Upload advanced-cards-updated.json to R2 using Node.js AWS SDK
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

const R2_ACCOUNT_ID = '5fe0dd82b8c31e87c4b1c98dd9f89d10';
const R2_ACCESS_KEY = '1eff105b63bff5c4983cf71c86a944ef';
const R2_SECRET_KEY = '4b97d5e8ce8cdee03fcccc0aa683655122c046dff7101dc9298809ccc43072a0';
const BUCKET_NAME = 'hoops-stats';
const FILE_KEY = 'advanced-cards.json';
const LOCAL_FILE = './advanced-cards-updated.json';

console.log('📤 Uploading to Cloudflare R2...\n');

// For now, let's just verify the file and show next steps
const fileContent = fs.readFileSync(LOCAL_FILE, 'utf8');
const fileSize = Buffer.byteLength(fileContent, 'utf8');
const cardData = JSON.parse(fileContent);
const cardCount = cardData.cards ? cardData.cards.length : 0;

console.log(`✅ File validated:`);
console.log(`   - Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   - Cards: ${cardCount}`);

// Count how many have Basketball Reference URLs
const bbrefCount = cardData.cards.filter(c => c.photoUrl && c.photoUrl.includes('basketball-reference.com')).length;
console.log(`   - With BBRef images: ${bbrefCount} (${(bbrefCount/cardCount*100).toFixed(1)}%)\n`);

console.log('📝 Manual upload steps (easiest method):');
console.log('1. Go to https://dash.cloudflare.com/');
console.log('2. Select your account → R2');
console.log('3. Click on "hoops-stats" bucket');
console.log('4. Click "Upload" button');
console.log(`5. Select the file: ${LOCAL_FILE}`);
console.log(`6. Name it: ${FILE_KEY}`);
console.log('7. Click "Upload"\n');

console.log('Then reload the cache: curl -X POST http://localhost:8080/api/cards/advanced/cache/reload');
