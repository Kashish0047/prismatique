const mongoose = require('mongoose');

// Single-document collection holding site-wide config.
const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'site', unique: true },
  streamneedsApiKey: { type: String, default: '' },
  streamneedsUserId: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);
