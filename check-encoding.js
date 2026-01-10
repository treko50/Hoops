const fs = require('fs');
const http = require('http');

// Fetch from API
http.get('http://localhost:8080/api/cards/advanced?minRating=0', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const jokic = json.cards.find(c => c.playerName && c.playerName.toLowerCase().includes('jokic'));

      if (jokic) {
        console.log('Jokic found!');
        console.log('Name:', jokic.playerName);
        console.log('Hex:', Buffer.from(jokic.playerName).toString('hex'));
        console.log('Correct name should be: Nikola Jokić');
        console.log('Correct hex: ', Buffer.from('Nikola Jokić').toString('hex'));
      } else {
        console.log('Jokic not found in response');
        console.log('Total cards:', json.cards.length);
        console.log('\nFirst 10 player names:');
        json.cards.slice(0, 10).forEach((card, i) => {
          console.log(`  ${i+1}. ${card.playerName}`);
        });

        // Look for names with special chars
        const doncic = json.cards.find(c => c.playerName && c.playerName.toLowerCase().includes('doncic'));
        if (doncic) {
          console.log('\nDoncic found!');
          console.log('Name:', doncic.playerName);
          console.log('Hex:', Buffer.from(doncic.playerName).toString('hex'));
        }
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', err => console.error('Request error:', err));
