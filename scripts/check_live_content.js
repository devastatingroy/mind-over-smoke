import https from 'https';

https.get('https://royfree.men/index.html?t=' + Date.now(), (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTML preview:', data.slice(0, 500));
    // Find JS file referenced
    const match = data.match(/src="([^"]+index-[^"]+\.js)"/);
    if (match) {
      const jsUrl = 'https://royfree.men/' + match[1].replace('./', '');
      console.log('JS Bundle URL:', jsUrl);
      https.get(jsUrl, (jsRes) => {
        let jsData = '';
        jsRes.on('data', chunk => jsData += chunk);
        jsRes.on('end', () => {
          console.log('Does JS contain Kenneth Rexroth?', jsData.includes('Kenneth Rexroth'));
          console.log('Does JS contain Arthur Waley?', jsData.includes('Arthur Waley'));
          console.log('Does JS contain "国破山河在，城春草木________"?', jsData.includes('国破山河在，城春草木________'));
        });
      });
    }
  });
}).on('error', err => console.error(err));
