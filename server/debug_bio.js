const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function debugUserBio(username) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log(`Navigating to https://kick.com/${username}...`);
  await page.goto(`https://kick.com/${username}`, { waitUntil: 'networkidle2' });
  
  // Wait a bit for JS to update bio
  await new Promise(r => setTimeout(r, 3000));

  const bio = await page.evaluate(async (user) => {
    try {
      const res = await fetch(`/api/v2/channels/${user}`);
      const json = await res.json();
      return json.user?.bio || json.bio || 'NO BIO FOUND';
    } catch (e) {
      return 'FETCH ERROR: ' + e.message;
    }
  }, username);

  console.log(`Bio found for ${username}: "${bio}"`);
  await browser.close();
}

// Get username from command line
const user = process.argv[2] || 'k_arora';
debugUserBio(user);
