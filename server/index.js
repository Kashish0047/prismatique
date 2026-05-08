const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const mongoose = require('mongoose');
puppeteer.use(StealthPlugin());
require('dotenv').config();

const User = require('./models/User');
const Player = require('./models/Player');
const Activity = require('./models/Activity');
const GameHistory = require('./models/GameHistory');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prismatique';

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');
    seedDatabase();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.log('💡 TIP: This is a DNS issue. Try changing your DNS to 8.8.8.8 or check your internet connection.');
    }
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ========== PUPPETEER QUEUE SYSTEM ==========
class PuppeteerQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.next();
    });
  }

  async next() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await Promise.race([
        task(),
        new Promise((_, j) => setTimeout(() => j(new Error('Task timeout (90s)')), 90000))
      ]);
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.processing = false;
      this.next();
    }
  }
}

const pQueue = new PuppeteerQueue();

// In-memory stores
const verificationCodes = new Map();
const streamInfoCache = new Map();
const activeFetches = new Set(); // Track usernames being fetched
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Mock Database / State

// ========== ROUTES ==========

app.get('/api/leaderboard', async (req, res) => {
  try {
    const players = await Player.find().sort({ rank: 1 });
    res.json({
      success: true,
      data: players,
      endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching leaderboard" });
  }
});

app.get('/api/activity', async (req, res) => {
  try {
    // Only fetch non-login activities to make the feed dynamic and game-focused
    const activities = await Activity.find({ action: { $not: /logged in/i } })
      .sort({ timestamp: -1 })
      .limit(10);
      
    const getTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    };

    const formatted = activities.map(a => ({
      id: a._id,
      user: a.user,
      action: a.action,
      time: getTimeAgo(a.timestamp)
    }));
    
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching activity" });
  }
});

app.post('/api/auth/start', async (req, res) => {
  const { username } = req.body;
  if (!username || username.length < 3) {
    return res.status(400).json({ success: false, message: "Invalid username (min 3 chars)" });
  }
  const reserved = ['admin', 'test', 'root', 'invalid'];
  if (reserved.includes(username.toLowerCase())) {
    return res.status(400).json({ success: false, message: "This username is reserved." });
  }
  const code = `PRIS-${Math.floor(1000 + Math.random() * 9000)}`;
  verificationCodes.set(username.toLowerCase(), code);
  res.json({ success: true, code });
});

// ========== KICK DATA FETCHING ==========

// Lightweight API-only fetch (NO Puppeteer) — used for stream sidebar
const fetchStreamInfoLightweight = async (username) => {
  const apis = [
    `https://kick.com/api/v2/channels/${username}`,
    `https://kick.com/api/v1/channels/${username}`,
  ];

  for (const apiUrl of apis) {
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://kick.com/',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000
      });

      const d = response.data?.data || response.data;
      return {
        followers: d?.followers_count || d?.followersCount || d?.followers || 0,
        isLive: !!(d?.livestream && d?.livestream?.is_live !== false),
        category: d?.livestream?.categories?.[0]?.name || d?.recent_categories?.[0]?.name || 'Offline',
      };
    } catch (err) {
      // Try next API
      continue;
    }
  }

  // API blocked — return null (caller will use defaults)
  return null;
};

// Stream Info endpoint — fast, never blocks the server
app.get('/api/kick/stream-info/:username', async (req, res) => {
  const { username } = req.params;
  const lowerUser = username.toLowerCase();

  // Return cache if fresh (5 minutes for stream info)
  const cached = streamInfoCache.get(lowerUser);
  if (cached && (Date.now() - cached.timestamp < 5 * 60 * 1000)) {
    return res.json({ success: true, ...cached.data });
  }

  // Try API (fast, ~1 second)
  let apiData = await fetchStreamInfoLightweight(username);
  
  if (!apiData) {
    if (activeFetches.has(lowerUser)) {
      console.log(`⏳ [Stream] Fetch already in progress for ${username}`);
    } else {
      console.log(`🔄 [Stream] API blocked for ${username}, falling back to Puppeteer...`);
      activeFetches.add(lowerUser);
      try {
        apiData = await pQueue.add(() => fetchKickDataViaPuppeteer(username));
      } catch (err) {
        console.error(`❌ [Stream] Puppeteer fallback failed:`, err.message);
      } finally {
        activeFetches.delete(lowerUser);
      }
    }
  }

  if (apiData) {
    const result = { exists: true, ...apiData };
    streamInfoCache.set(lowerUser, { timestamp: Date.now(), data: result });
    return res.json({ success: true, ...result });
  }

  const defaults = {
    exists: true,
    followers: 0,
    isLive: false,
    category: 'Slots',
  };
  return res.json({ success: true, ...defaults });
});

// ========== BIO VERIFICATION (uses Puppeteer — only for login) ==========

const fetchKickDataViaPuppeteer = async (username) => {
  let browser = null;
  try {
    console.log(`🚀 [Puppeteer] Launching browser for ${username}...`);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    
    await page.goto(`https://kick.com/${username}`, { 
      waitUntil: 'networkidle2', 
      timeout: 45000 
    });

    // Wait for bio or followers to be visible
    await page.waitForSelector('body', { timeout: 10000 });

    const data = await page.evaluate(async (user) => {
      const timestamp = Date.now();
      let followers = 0;
      let bio = '';
      let isLive = false;
      let category = 'Offline';

      // Try internal API fetch first (Cloudflare bypass)
      try {
        const res = await fetch(`/api/v2/channels/${user}?t=${timestamp}`);
        if (res.ok) {
          const json = await res.json();
          const d = json.data || json;
          followers = d.followers_count || d.followersCount || 0;
          bio = d.user?.bio || d.bio || '';
          isLive = !!(d.livestream && d.livestream.is_live);
          category = d.livestream?.categories?.[0]?.name || 'Offline';
        }
      } catch (e) {}

      // DOM Fallback for Followers
      if (!followers) {
        try {
          const followerEl = Array.from(document.querySelectorAll('span, div, p')).find(el => 
            el.textContent.toLowerCase().includes('followers') && /\d/.test(el.textContent)
          );
          if (followerEl) {
            const matches = followerEl.textContent.match(/[\d,.]+/);
            if (matches) followers = parseInt(matches[0].replace(/,/g, ''), 10);
          }
        } catch (e) {}
      }

      // DOM Fallback for Bio
      if (!bio) {
        try {
          const bioEl = document.querySelector('[data-test="user-bio"]') || document.querySelector('.user-bio');
          if (bioEl) bio = bioEl.textContent;
        } catch (e) {}
      }

      return { followers, bio, isLive, category };
    }, username);

    return data;
  } catch (err) {
    console.error(`❌ [Puppeteer] Error fetching ${username}:`, err.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
};

app.post('/api/auth/confirm', async (req, res) => {
  const { username } = req.body;
  const expectedCode = verificationCodes.get(username.toLowerCase());

  if (!expectedCode) {
    return res.status(400).json({ success: false, message: "Verification not started." });
  }

  console.log(`🔍 Verifying bio for ${username}... Expected code: ${expectedCode}`);

  // For authentication, ALWAYS use Puppeteer to get the freshest data and bypass cache/blocks
  let data = await pQueue.add(() => fetchKickDataViaPuppeteer(username));
  let bio = data?.bio || '';

  // If not found, wait 5 seconds and try one more time (Kick API can be slow to update)
  if (!bio || !bio.includes(expectedCode)) {
    console.log(`⏳ Code not found in first try for ${username}, retrying in 5s...`);
    await new Promise(r => setTimeout(r, 5000));
    data = await pQueue.add(() => fetchKickDataViaPuppeteer(username));
    bio = data?.bio || '';
  }

  if (bio && bio.includes(expectedCode)) {
    verificationCodes.delete(username.toLowerCase());
    
    // Save or update user in MongoDB
    try {
      let user = await User.findOne({ username: username.toLowerCase() });
      if (!user) {
        user = new User({
          username: username.toLowerCase(),
          avatar: `https://ui-avatars.com/api/?name=${username}&background=53fc18&color=000`
        });
      }
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        user: { 
          username: user.username, 
          avatar: user.avatar,
          isFollowing: user.isFollowing 
        }
      });

      // Log activity
      new Activity({ user: username, action: "logged in" }).save();
    } catch (err) {
      console.error("DB Error during login:", err);
      res.status(500).json({ success: false, message: "Database error" });
    }
  } else {
    res.status(401).json({ success: false, message: "Code not found in bio. Make sure you saved it and your profile is public." });
  }
});

// ========== KICK OAUTH ROUTES ==========

const base64URLEncode = (str) => {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const sha256 = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest();
};

app.get('/api/auth/kick', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const codeChallenge = base64URLEncode(sha256(Buffer.from(codeVerifier)));
  const returnTo = req.query.return_to || '/';

  const cookieOptions = { 
    httpOnly: true, 
    maxAge: 900000, 
    sameSite: 'lax', 
    secure: false,
    path: '/'
  };
  
  console.log(`🔑 [OAuth] Starting for state: ${state}, returning to: ${returnTo}`);
  res.cookie('kick_auth_state', state, cookieOptions);
  res.cookie('kick_code_verifier', codeVerifier, cookieOptions);
  res.cookie('kick_return_to', returnTo, cookieOptions);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.KICK_CLIENT_ID,
    redirect_uri: process.env.KICK_REDIRECT_URI,
    scope: 'user:read',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  res.redirect(`https://id.kick.com/oauth/authorize?${params.toString()}`);
});

app.get('/api/auth/kick/callback', async (req, res) => {
  const { code, state, error } = req.query;
  const storedState = req.cookies.kick_auth_state;
  const codeVerifier = req.cookies.kick_code_verifier;
  const returnTo = req.cookies.kick_return_to || '/';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (error) {
    return res.redirect(`${clientUrl}${returnTo}?error=${error}`);
  }

  console.log('🔍 OAuth Callback received');
  if (!state || state !== storedState) {
    console.error('❌ State mismatch error');
    return res.redirect(`${clientUrl}${returnTo}?error=state_mismatch`);
  }

  try {
    // Exchange code for token
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', process.env.KICK_CLIENT_ID);
    params.append('client_secret', process.env.KICK_CLIENT_SECRET);
    params.append('redirect_uri', process.env.KICK_REDIRECT_URI);
    params.append('code_verifier', codeVerifier);

    const tokenResponse = await axios.post('https://id.kick.com/oauth/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenResponse.data;

    // Fetch user info
    const userResponse = await axios.get('https://api.kick.com/public/v1/users', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const kickUserRaw = userResponse.data;
    const kickUserData = (kickUserRaw?.data && kickUserRaw.data[0]) 
      ? kickUserRaw.data[0] 
      : (Array.isArray(kickUserRaw) ? kickUserRaw[0] : kickUserRaw);

    const username = kickUserData.name || kickUserData.username || kickUserData.display_name;
    const avatar = kickUserData.profile_picture || kickUserData.profile_image || kickUserData.avatar_url || `https://ui-avatars.com/api/?name=${username}&background=53fc18&color=000`;

    if (!username) throw new Error('Could not retrieve username from Kick API');

    let user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      user = new User({
        username: username.toLowerCase(),
        avatar: avatar
      });
    } else {
      user.avatar = avatar;
    }
    user.lastLogin = new Date();
    await user.save();

    new Activity({ user: username, action: "logged in via Kick" }).save();

    // Clear cookies
    res.clearCookie('kick_auth_state');
    res.clearCookie('kick_code_verifier');
    res.clearCookie('kick_return_to');

    // Redirect back to the starting page
    res.redirect(`${clientUrl}${returnTo}?login_success=true&username=${user.username}&avatar=${encodeURIComponent(user.avatar)}&coins=${user.coins}`);
  } catch (err) {
    console.error('❌ OAuth Detail Error:', err.response?.data || err.message);
    res.redirect(`${clientUrl}${returnTo}?error=auth_failed`);
  }
});

// ========== USER ROUTES ==========
app.post('/api/user/follow', async (req, res) => {
  const { username, isFollowing } = req.body;
  if (!username) return res.status(400).json({ success: false });

  try {
    const user = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { isFollowing },
      { new: true }
    );
    res.json({ success: true, isFollowing: user.isFollowing });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ========== COINS ROUTES ==========

app.get('/api/coins/balance/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const now = Date.now();
    const lastClaim = user.lastClaim ? new Date(user.lastClaim).getTime() : 0;
    const nextClaim = lastClaim + 60 * 60 * 1000;
    const canClaim = now >= nextClaim;
    res.json({ success: true, coins: user.coins, canClaim, nextClaimAt: nextClaim });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/coins/claim', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'Username required' });
  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const now = Date.now();
    const lastClaim = user.lastClaim ? new Date(user.lastClaim).getTime() : 0;
    const nextClaim = lastClaim + 60 * 60 * 1000;
    if (now < nextClaim) {
      return res.status(429).json({ success: false, message: 'Not ready yet', nextClaimAt: nextClaim });
    }
    user.coins += 20;
    user.lastClaim = new Date();
    await user.save();
    res.json({ success: true, coins: user.coins, nextClaimAt: Date.now() + 60 * 60 * 1000 });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ========== GAMES ROUTE ==========

app.post('/api/games/play', async (req, res) => {
  const { username, game, betAmount, params } = req.body;
  if (!username || !game || !betAmount || betAmount < 1) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }
  try {
    let user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      // Auto-create user if they are missing in the DB but have a local session
      user = new User({
        username: username.toLowerCase(),
        avatar: `https://ui-avatars.com/api/?name=${username}&background=53fc18&color=000`,
        coins: 100
      });
      await user.save();
    }
    if (user.coins < betAmount) return res.status(400).json({ success: false, message: 'Not enough coins. Use the Faucet to claim more!' });

    let result = 'loss';
    let payout = 0;
    let details = {};

    if (game === 'dice') {
      // params: { target: 50, direction: 'over' | 'under' }
      const roll = Math.floor(Math.random() * 100) + 1;
      const { target, direction } = params;
      const win = direction === 'over' ? roll > target : roll < target;
      const chance = direction === 'over' ? (100 - target) / 100 : target / 100;
      const multiplier = chance > 0 ? parseFloat((0.98 / chance).toFixed(2)) : 1;
      if (win) { result = 'win'; payout = Math.floor(betAmount * multiplier); }
      details = { roll, target, direction, multiplier };

    } else if (game === 'limbo') {
      // params: { targetMultiplier: 2.5 }
      const { targetMultiplier } = params;
      const randomMultiplier = parseFloat((1 / (Math.random() * 0.97)).toFixed(2));
      if (randomMultiplier >= targetMultiplier) {
        result = 'win'; payout = Math.floor(betAmount * targetMultiplier);
      }
      details = { randomMultiplier, targetMultiplier };

    } else if (game === 'mines') {
      // params: { mineCount: 5, revealedSafe: 3 }  - frontend tracks progress
      const { mineCount, revealedSafe } = params;
      const totalCells = 25;
      const safeCells = totalCells - mineCount;
      let multiplier = 1;
      for (let i = 0; i < revealedSafe; i++) {
        multiplier *= (safeCells - i) / (totalCells - i);
      }
      multiplier = parseFloat((0.97 / multiplier).toFixed(2));
      // Determine if current reveal is a mine
      const hitMine = Math.random() < mineCount / (totalCells - revealedSafe);
      if (!hitMine) { result = 'win'; payout = Math.floor(betAmount * multiplier); }
      details = { mineCount, revealedSafe, multiplier, hitMine };

    } else if (game === 'dragon_tower') {
      // params: { level: 1 }  1-5 levels; each level has 1 bad egg out of 3
      const { level } = params;
      const hitBad = Math.random() < 1 / 3;
      const multiplier = parseFloat((Math.pow(1.5, level)).toFixed(2));
      if (!hitBad) { result = 'win'; payout = Math.floor(betAmount * multiplier); }
      details = { level, multiplier, hitBad };

    } else if (game === 'chicken') {
      // params: {}  pick 1 of 5, 1 wins (5x)
      const winnerIndex = Math.floor(Math.random() * 5);
      const { pick } = params;
      if (pick === winnerIndex) { result = 'win'; payout = betAmount * 5; }
      details = { winnerIndex, pick };
    }

    // Update coins
    user.coins = result === 'win' ? user.coins - betAmount + payout : user.coins - betAmount;
    await user.save();

    // Save game history
    await new GameHistory({ username: username.toLowerCase(), game, betAmount, result, payout, details }).save();

    // Log activity
    if (result === 'win') {
      new Activity({ user: username, action: `won ${payout} coins in ${game}` }).save();
    }

    res.json({ success: true, result, payout, coins: user.coins, details });
  } catch (err) {
    console.error('Game Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== SERVER STARTUP ==========

// Prevent crashes
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Internal IP: http://127.0.0.1:${PORT}`);
  
  // Prefetch stream info after a delay to avoid resource contention
  setTimeout(() => {
    console.log('📡 Prefetching Prismatique stream info...');
    if (activeFetches.has('prismatique')) return;
    activeFetches.add('prismatique');
    
    pQueue.add(() => fetchKickDataViaPuppeteer('prismatique')).then(data => {
      if (data) {
        streamInfoCache.set('prismatique', { 
          timestamp: Date.now(), 
          data: { exists: true, ...data } 
        });
        console.log(`✅ Prefetch complete. Followers: ${data.followers}, Live: ${data.isLive}`);
      } else {
        console.log('⚠️ Prefetch failed, will try again on first request.');
      }
    }).catch(err => {
      console.log('⚠️ Prefetch error:', err.message);
    }).finally(() => {
      activeFetches.delete('prismatique');
    });
  }, 10000); // 10s delay
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    process.exit(1);
  }
});

// ========== SEEDING LOGIC ==========
async function seedDatabase() {
  try {
    const playerCount = await Player.countDocuments();
    if (playerCount === 0) {
      console.log('🌱 Seeding initial leaderboard data...');
      const initialPlayers = [
        { rank: 1, username: "PlayerOne", wageredUsd: 15000, xp: 2450, level: 24, badges: ["👑", "🔥"] },
        { rank: 2, username: "HighRoller", wageredUsd: 12500, xp: 2100, level: 21, badges: ["🎯"] },
        { rank: 3, username: "LuckyStar", wageredUsd: 10000, xp: 1800, level: 18, badges: ["🎰"] },
        { rank: 4, username: "CryptoKing", wageredUsd: 8500, xp: 1500, level: 15, badges: [] },
        { rank: 5, username: "BetMaster", wageredUsd: 7000, xp: 1200, level: 12, badges: [] },
        { rank: 6, username: "Jackpot777", wageredUsd: 5500, xp: 900, level: 9, badges: [] },
        { rank: 7, username: "SpinWin", wageredUsd: 4000, xp: 750, level: 7, badges: [] },
        { rank: 8, username: "LuckyCharm", wageredUsd: 3000, xp: 600, level: 6, badges: [] },
        { rank: 9, username: "BetPro", wageredUsd: 2000, xp: 450, level: 4, badges: [] },
        { rank: 10, username: "NewPlayer", wageredUsd: 1000, xp: 200, level: 2, badges: [] }
      ];
      await Player.insertMany(initialPlayers);
    }

    const activityCount = await Activity.countDocuments();
    if (activityCount === 0) {
      console.log('🌱 Seeding initial activity data...');
      const initialActivity = [
        { user: "PlayerOne", action: "reached Level 24", timestamp: new Date() },
        { user: "LuckyStar", action: "won $250 in a raffle", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
        { user: "HighRoller", action: "just wagered $1,200", timestamp: new Date(Date.now() - 1000 * 60 * 15) }
      ];
      await Activity.insertMany(initialActivity);
    }

    // Dynamic Activity Simulator: Generate realistic casino activity every 30-60 seconds
    setInterval(async () => {
      try {
        const fakeUsers = ['CryptoKing', 'BetMaster', 'Jackpot777', 'SpinWin', 'HighRoller', 'LuckyStar', 'PrismPlayer', 'Whale99', 'DiceGod', 'LimboKing'];
        const fakeGames = ['dice', 'limbo', 'mines', 'dragon_tower', 'chicken'];
        
        const randomUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        const randomGame = fakeGames[Math.floor(Math.random() * fakeGames.length)];
        
        const isWin = Math.random() > 0.6; // 40% chance to win, 60% chance to just wager
        
        let actionStr = '';
        if (isWin) {
          const winAmount = Math.floor(Math.random() * 500) + 50;
          actionStr = `won ${winAmount} coins in ${randomGame}`;
        } else {
          const wagerAmount = Math.floor(Math.random() * 100) + 10;
          actionStr = `wagered ${wagerAmount} coins in ${randomGame}`;
        }

        // 10% chance to hit a level up instead
        if (Math.random() > 0.9) {
          const level = Math.floor(Math.random() * 50) + 2;
          actionStr = `reached Level ${level}`;
        }

        await new Activity({ user: randomUser, action: actionStr, timestamp: new Date() }).save();
        
        // Keep the database clean, delete activities older than 24 hours
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await Activity.deleteMany({ timestamp: { $lt: yesterday } });
        
      } catch (e) {
        console.error("Activity Simulator Error:", e.message);
      }
    }, 45000); // Every 45 seconds

  } catch (err) {
    console.error("❌ Seeding Error:", err);
  }
}
