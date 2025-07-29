const express = require('express');
const User = require("../models/user");
const {handleStopUpdates, createUpdateLocationHandler, createStopUpdatesHandler} = require("../controllers/location");

const Router = express.Router();

function LocationRouterHandler(io){
    const Router = express.Router();
    Router.post('/location-update',createUpdateLocationHandler(io));
    Router.post('/stop-tracking',createStopUpdatesHandler(io));
    return Router;
}


module.exports = LocationRouterHandler;