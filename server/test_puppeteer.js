const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const testPuppeteer = async (username) => {
  let browser = null;
  try {
    console.log(`Launching browser for ${username}...`);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

    let channelData = null;
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes(`/api/v1/channels/${username}`)) {
        try {
          channelData = await response.json();
          console.log('✅ Found API response in network!');
        } catch (_) {}
      }
    });

    console.log(`Navigating to https://kick.com/${username}...`);
    await page.goto(`https://kick.com/${username}`, { waitUntil: 'networkidle2', timeout: 60000 });

    await new Promise(r => setTimeout(r, 5000));

    if (channelData) {
      console.log('Followers:', channelData.followers_count);
      console.log('Is Live:', !!channelData.livestream);
      console.log('Category:', channelData.livestream?.categories?.[0]?.name || 'Offline');
    } else {
      console.log('❌ Failed to intercept API response.');
      const content = await page.content();
      console.log('Page content length:', content.length);
      if (content.includes('Cloudflare')) {
        console.log('⚠️ Blocked by Cloudflare!');
      }
    }

    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
    if (browser) await browser.close();
  }
};

testPuppeteer('prismatique');
