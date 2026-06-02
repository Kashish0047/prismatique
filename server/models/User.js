const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String },
  isFollowing: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 100 },
  lastClaim: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
