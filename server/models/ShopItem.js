const mongoose = require('mongoose');

const ShopItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },             // image URL
  price: { type: Number, default: 0 },              // cost in coins
  quantity: { type: Number, default: -1 },          // stock; -1 = unlimited
  status: { type: String, enum: ['active', 'hidden', 'soldout'], default: 'active' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShopItem', ShopItemSchema);
