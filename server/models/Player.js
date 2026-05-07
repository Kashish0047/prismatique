const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  rank: { type: Number },
  username: { type: String, required: true, unique: true },
  wageredUsd: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }]
});

module.exports = mongoose.model('Player', PlayerSchema);
