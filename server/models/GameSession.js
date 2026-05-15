const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
  username: { type: String, required: true, lowercase: true },
  gameType: { type: String, enum: ['chicken', 'mines'], required: true },
  betAmount: { type: Number, required: true },
  boneCount: { type: Number, default: 1 }, // for chicken
  mineCount: { type: Number, default: 1 }, // for mines
  grid: { type: [String], required: true }, // e.g., ['chicken', 'bone', ...]
  revealedIndices: { type: [Number], default: [] },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  result: { type: String, enum: ['win', 'loss', null], default: null },
  payout: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour
});

module.exports = mongoose.model('GameSession', GameSessionSchema);
