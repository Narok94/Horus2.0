const https = require('https');
https.get('https://raw.githubusercontent.com/Narok94/Horus2.0/main/assets/logo/logo.png', (res) => {
  console.log("Status:", res.statusCode);
});
