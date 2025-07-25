const express = require('express');
const User = require("../models/user");
const redisClient = require("../redisClient");

async function handleUpdateLocation(req,res){
    if(!req.body.lat || !req.body.lon || !req.body.uuid) return res.status(400).json({msg:"Missing fields"});
    const {lat,lon,uuid} = req.body;
    console.log(lat,lon,uuid);

    try {
        const locationData = JSON.stringify({lat,lon});

        //Storing it in redis
        await redisClient.set(`location:${uuid}`,locationData);
        await redisClient.sAdd(`location:pendingUsers`,uuid);
        console.log("Successfully stored in redis");
        return res.status(201).json({msg: "successfully stored in redis"});

    }catch (err){
        return res.status(500).json({msg:"Internal server error"});
    }

}

module.exports = {
    handleUpdateLocation,
}