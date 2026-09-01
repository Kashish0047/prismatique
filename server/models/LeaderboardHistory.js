const mongoose = require('mongoose');

const LeaderboardHistorySchema = new mongoose.Schema({
  leaderboardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Leaderboard' },
  name: { type: String },
  platform: { type: String },
  periodStart: { type: Date },
  periodEnd: { type: Date },
  standings: [{
    rank: Number,
    username: String,
    avatar: String,
    points: Number,
    platforms: Object
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LeaderboardHistory', LeaderboardHistorySchema);
