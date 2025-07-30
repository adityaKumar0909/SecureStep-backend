const express = require('express');
const User = require("../models/user");
const redisClient = require("../redisClient");

function createUpdateLocationHandler(io) {
    return async function handleUpdateLocation(req, res) {
        const { lat, lon, uuid } = req.body;

        if (!lat || !lon || !uuid) {
            return res.status(400).json({ msg: "Missing fields" });
        }

        console.log(`👋🏻 Hey we got a location from  ${uuid}`)


        try {
            const locationData = JSON.stringify({ lat, lon });

            // Save to Redis
            await redisClient.set(`location:${uuid}`, locationData );
            await redisClient.expire(`location:${uuid}`, 120);
            await redisClient.set(`tracking:${uuid}`,"true");
            await redisClient.expire(`tracking:${uuid}`, 120);

            await redisClient.sAdd(`location:pendingUsers`, uuid);


            console.log("Location saved in Redis");

            // Immediately broadcast to the room
            const tracking = await redisClient.get(`tracking:${uuid}`);
            io.to(uuid).emit("receive-location", {
                userId: uuid,
                location: { lat, lon },
                tracking: tracking === "true"
            });

            return res.status(201).json({ msg: "Location updated and emitted" });

        } catch (err) {
            console.error("Error saving location:", err);
            return res.status(500).json({ msg: "Internal server error" });
        }
    };
}
function createStopUpdatesHandler(io) {
    return async function handleStopUpdates(req,res){
        console.log("🐶 We got a request to stop tracking");
        const {uuid} = req.body;
        if(!uuid) return res.status(400).json({msg:"Missing fields"});

        try{
            const lastKnownLocation = await redisClient.get(`location:${uuid}`);

            // //Clean all data of that user from redis
            // await redisClient.del(`tracking:${uuid}`);
            // await redisClient.del(`location:${uuid}`);
            await redisClient.sRem(`location:pendingUsers`,uuid);

            //Tell the dashboard that user is offline now
            io.to(uuid).emit("receive-location", {
                userId: uuid,
                location: lastKnownLocation ? JSON.parse(lastKnownLocation) : null,
                tracking: false
            });

            //Update in mongoDB
            await User.findOneAndUpdate({uuid},{$set:{isTrackingOn:false}});
            console.log("Tracking stopped and cleaned from Redis and MongoDB");
            return res.status(200).json({ msg: "Tracking stopped and cleaned from Redis" });
        }catch(err){
            console.error("Error stopping tracking:",err);
            return res.status(500).json({msg:"Internal server error"});
        }

    }
}




module.exports = {
    createUpdateLocationHandler,createStopUpdatesHandler
}