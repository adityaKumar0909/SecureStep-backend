const User = require('../models/user');
const redisClient = require('../redisClient');

async function flushRedisToMongoDB() {
    try {
        const uuids = await redisClient.sMembers(`location:pendingUsers`);
        if (!uuids.length) return;

        const bulkOps = [];

        for (const uuid of uuids) {
            const data = await redisClient.get(`location:${uuid}`);
            if (!data) continue;

            const {lat, lon} = JSON.parse(data);
            //Instead of pushing in 10 different times for 10 diff users,it collects
            //all the task in a bag and after the end of this loop it will just write
            //all at once.
            bulkOps.push({
                updateOne: {
                    filter: { uuid },
                    update: {
                        $set: {
                            lastLocationDuringTracking: { lat, lon },
                        },
                    },
                },
            })



            //clean up
            await redisClient.del(`location:${uuid}`);
            await redisClient.sRem(`location:pendingUsers`,uuid);
        }

        if(bulkOps.length > 0) {
            await User.bulkWrite(bulkOps);
            console.log(`Bulk write done for ${bulkOps.length} users`);
        }
        console.log("Location data flushed to MongoDB");
        console.log(`✅ Flushed ${uuids.length} user location(s) to MongoDB.`);


    }catch (e) {
        console.error(`Error flushing data to MongoDB:${e}`);
    }

}

module.exports = flushRedisToMongoDB;