const express = require('express');
const cors = require('cors');
const axios = require('axios');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Database / State
const players = [
  { id: 1, rank: 1, username: "PlayerOne", wageredUsd: 15000, xp: 2450, level: 24, badges: ["👑", "🔥"] },
  { id: 2, rank: 2, username: "HighRoller", wageredUsd: 12500, xp: 2100, level: 21, badges: ["🎯"] },
  { id: 3, rank: 3, username: "LuckyStar", wageredUsd: 10000, xp: 1800, level: 18, badges: ["🎰"] },
  { id: 4, rank: 4, username: "CryptoKing", wageredUsd: 8500, xp: 1500, level: 15, badges: [] },
  { id: 5, rank: 5, username: "BetMaster", wageredUsd: 7000, xp: 1200, level: 12, badges: [] },
  { id: 6, rank: 6, username: "Jackpot777", wageredUsd: 5500, xp: 900, level: 9, badges: [] },
  { id: 7, rank: 7, username: "SpinWin", wageredUsd: 4000, xp: 750, level: 7, badges: [] },
  { id: 8, rank: 8, username: "LuckyCharm", wageredUsd: 3000, xp: 600, level: 6, badges: [] },
  { id: 9, rank: 9, username: "BetPro", wageredUsd: 2000, xp: 450, level: 4, badges: [] },
  { id: 10, rank: 10, username: "NewPlayer", wageredUsd: 1000, xp: 200, level: 2, badges: [] }
];

// Activity Feed Mock
const activity = [
  { id: 1, user: "PlayerOne", action: "reached Level 24", time: "2m ago" },
  { id: 2, user: "LuckyStar", action: "won $250 in a raffle", time: "5m ago" },
  { id: 3, user: "HighRoller", action: "just wagered $1,200", time: "12m ago" }
];

// Helper function to check Kick User (Stricter Check)
const checkKickUser = async (username) => {
  try {
    // 1. Basic Validation
    if (!username || username.length < 3) return false;
    
    // 2. Mocking a real database of "Valid" users for your testing
    // In a real production app, we would fetch https://kick.com/api/v1/channels/${username}
    // But since Kick has Cloudflare, for this demo, let's allow only these 
    // unless you want me to set up a proxy.
    const forbiddenUsernames = ['admin', 'test', 'root', 'invalid', 'null', 'undefined'];
    if (forbiddenUsernames.includes(username.toLowerCase())) return false;

    // Real-ish check: Kick usernames don't have spaces and special chars (mostly)
    const regex = /^[a-zA-Z0-9_-]+$/;
    if (!regex.test(username)) return false;

    return true; 
  } catch (error) {
    return false;
  }
};

// Routes
app.get('/api/leaderboard', (req, res) => {
  res.json({
    success: true,
    data: players,
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  });
});

app.get('/api/activity', (req, res) => {
  res.json({
    success: true,
    data: activity
  });
});

// In-memory store for verification codes (In production, use Redis or DB)
const verificationCodes = new Map();

app.post('/api/auth/start', async (req, res) => {
  const { username } = req.body;
  if (!username || username.length < 3) {
    return res.status(400).json({ success: false, message: "Invalid username (min 3 chars)" });
  }

  // Stricter check for reserved names
  const reserved = ['admin', 'test', 'root', 'invalid'];
  if (reserved.includes(username.toLowerCase())) {
    return res.status(400).json({ success: false, message: "This username is reserved." });
  }

  // Generate a random 4-digit code
  const code = `PRIS-${Math.floor(1000 + Math.random() * 9000)}`;
  verificationCodes.set(username.toLowerCase(), code);

  res.json({ success: true, code });
});

// Strategy 1: Try Kick's JSON API directly (fast, no browser needed)
const fetchKickBioViaAPI = async (username) => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  ];
  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

  try {
    const response = await axios.get(`https://kick.com/api/v1/channels/${username}`, {
      headers: {
        'User-Agent': randomUA,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://kick.com/',
        'Origin': 'https://kick.com',
      },
      timeout: 10000
    });
    const bio = response.data?.user?.bio || response.data?.channel?.user?.bio || '';
    console.log(`✅ [API] Bio for ${username}: "${bio}"`);
    return { exists: true, bio };
  } catch (err) {
    console.log(`⚠️ [API] Failed for ${username}: ${err.response?.status || err.message}`);
    return null; // Signal to try Puppeteer
  }
};

// Strategy 2: Puppeteer Stealth - renders the full SPA and searches page text
const fetchKickBioViaPuppeteer = async (username) => {
  let browser = null;
  try {
    console.log(`🔍 [Puppeteer] Launching Stealth Browser for ${username}...`);
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1366,768',
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    // Intercept the Kick API response directly from the network (most reliable)
    let apiBio = null;
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes(`/api/v1/channels/${username}`) || url.includes(`/api/v2/channels/${username}`)) {
        try {
          const json = await response.json();
          apiBio = json?.user?.bio || json?.channel?.user?.bio || json?.bio || '';
          console.log(`✅ [Network Intercept] Bio: "${apiBio}"`);
        } catch (_) {}
      }
    });

    console.log(`🌐 [Puppeteer] Navigating to kick.com/${username}/about...`);
    await page.goto(`https://kick.com/${username}/about`, { waitUntil: 'domcontentloaded', timeout: 35000 });

    // Wait a bit for XHR/fetch calls to complete
    await new Promise(r => setTimeout(r, 4000));

    // If we got the bio from network intercept, use it
    if (apiBio !== null) {
      await browser.close();
      return { exists: true, bio: apiBio };
    }

    // Fallback: search full page text for the PRIS- code pattern
    const fullPageText = await page.evaluate(() => document.body.innerText);
    console.log(`📄 [Puppeteer] Page text length: ${fullPageText.length}`);
    await browser.close();

    // If the page shows 404/error, account doesn't exist
    if (fullPageText.includes("can't find the page") || fullPageText.includes('404')) {
      return { exists: false, bio: '' };
    }

    return { exists: true, bio: fullPageText };

  } catch (error) {
    console.error(`❌ [Puppeteer] Error for ${username}:`, error.message);
    if (browser) await browser.close();
    return { exists: false, bio: '' };
  }
};

// Main fetchKickBio: tries API first, falls back to Puppeteer
const fetchKickBio = async (username) => {
  const apiResult = await fetchKickBioViaAPI(username);
  if (apiResult) return apiResult;
  console.log(`🔄 API blocked, falling back to Puppeteer Stealth for ${username}...`);
  return await fetchKickBioViaPuppeteer(username);
};

app.post('/api/auth/confirm', async (req, res) => {
  const { username } = req.body;
  const expectedCode = verificationCodes.get(username.toLowerCase());

  if (!expectedCode) {
    return res.status(400).json({ success: false, message: "Verification not started for this user." });
  }

  console.log(`🔐 Starting dynamic verification for ${username}...`);
  const kickData = await fetchKickBio(username);
  
  if (!kickData.exists) {
    return res.status(404).json({ 
      success: false, 
      message: `Kick username '${username}' does not exist or could not be fetched. If the name is correct, Kick is blocking our check.`
    });
  }

  // Check if the generated code is inside the bio
  if (kickData.bio && kickData.bio.includes(expectedCode)) {
    verificationCodes.delete(username.toLowerCase());
    res.json({ 
      success: true, 
      user: { 
        username, 
        avatar: `https://ui-avatars.com/api/?name=${username}&background=53fc18&color=000` 
      } 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: "Code not found in your bio. Please make sure you saved it and your profile is public."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
