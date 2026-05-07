const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema({
  username: { type: String, required: true },
  game: { type: String, required: true },
  betAmount: { type: Number, required: true },
  result: { type: String, enum: ['win', 'loss'], required: true },
  payout: { type: Number, required: true },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameHistory', GameHistorySchema);
