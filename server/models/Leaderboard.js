const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  name: { type: String, required: true },          // e.g. "Qzino Monthly Wager"
  platform: { type: String, default: '' },         // tab label, e.g. "Qzino"
  provider: { type: String, default: 'streamneeds' },
  apiKey: { type: String, required: true },         // StreamNeeds bh_sk_... key for this board
  limit: { type: Number, default: 20 },
  prizeText: { type: String, default: '' },         // free-text prize breakdown
  metricLabel: { type: String, default: 'POINTS' }, // column label, e.g. "WAGERED"
  accentColor: { type: String, default: '#00f2ff' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  useBaseline: { type: Boolean, default: true },    // subtract reset-time points => per-period board
  baseline: { type: Object, default: {} },          // { viewerId: pointsAtLastReset }
  periodStartedAt: { type: Date, default: Date.now },
  lastResetAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
