const cron = require('node-cron');
const flushRedisToMongoDB = require('../jobs/flushRedisToMongoDB');


//Run every 30 secs
cron.schedule('*/30 * * * * *', () => {
    flushRedisToMongoDB();
})