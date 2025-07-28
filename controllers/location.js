const express = require('express');
const User = require("../models/user");
const redisClient = require("../redisClient");

function createUpdateLocationHandler(io) {
    return async function handleUpdateLocation(req, res) {
        const { lat, lon, uuid } = req.body;

        if (!lat || !lon || !uuid) {
            return res.status(400).json({ msg: "Missing fields" });
        }

        try {
            const locationData = JSON.stringify({ lat, lon });

            // Save to Redis
            await redisClient.set(`location:${uuid}`, locationData);
            await redisClient.sAdd(`location:pendingUsers`, uuid);

            console.log("Location saved in Redis");

            // Immediately broadcast to the room
            io.to(uuid).emit("receive-location", {
                userId: uuid,
                location: { lat, lon }
            });

            return res.status(201).json({ msg: "Location updated and emitted" });

        } catch (err) {
            console.error("Error saving location:", err);
            return res.status(500).json({ msg: "Internal server error" });
        }
    };
}


module.exports = {
    createUpdateLocationHandler
}