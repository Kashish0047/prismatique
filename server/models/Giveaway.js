const mongoose = require('mongoose');

const GiveawaySchema = new mongoose.Schema({
  title: { type: String, required: true },
  prize: { type: String, required: true },
  description: { type: String },
  code: { type: String }, // For giveaway codes
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  participants: [{ type: String }], // Array of usernames
  winners: [{ type: String }], // Array of usernames
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Giveaway', GiveawaySchema);
