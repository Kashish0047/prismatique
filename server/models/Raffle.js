const mongoose = require('mongoose');

const RaffleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  prize: { type: String, required: true },
  description: { type: String },
  requirement: { type: String, default: 'None' },
  status: { type: String, enum: ['active', 'upcoming', 'ended'], default: 'upcoming' },
  entries: { type: Number, default: 0 },
  maxEntries: { type: Number, default: 1000 },
  participants: [{ type: String }], // Array of usernames
  endsAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Raffle', RaffleSchema);
