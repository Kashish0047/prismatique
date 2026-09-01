// Local-only: spins up an in-memory MongoDB on port 27017 so the API can be
// tested without installing MongoDB. Data is NOT persisted between runs.
// Usage: node scripts/dev-mongo.js   (leave running in its own terminal)
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'prismatique' },
  });
  console.log('🧪 In-memory MongoDB running at', mongod.getUri());
  console.log('   Leave this window open. Ctrl+C to stop (data is wiped).');

  const stop = async () => { await mongod.stop(); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})();
