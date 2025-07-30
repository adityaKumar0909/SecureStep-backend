const cron = require('node-cron');
const flushRedisToMongoDB = require('../jobs/flushRedisToMongoDB');


//Run every 40 secs
cron.schedule('*/40 * * * * *', () => {
    flushRedisToMongoDB();
})