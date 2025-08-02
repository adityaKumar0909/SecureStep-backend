const cron = require('node-cron');
const flushRedisToMongoDB = require('../jobs/flushRedisToMongoDB');


//Run every 2 mins
cron.schedule('*/2 * * * *', () => {
    flushRedisToMongoDB();
})