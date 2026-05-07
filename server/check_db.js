const mongoose = require('mongoose');
require('dotenv').config();

const Player = require('./models/Player');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const count = await Player.countDocuments();
    console.log(`Players in DB: ${count}`);
    if (count > 0) {
      const players = await Player.find().limit(2);
      console.log('Sample players:', JSON.stringify(players, null, 2));
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
