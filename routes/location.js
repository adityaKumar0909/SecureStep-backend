const express = require('express');
const User = require("../models/user");
const {handleUpdateLocation, createUpdateLocationHandler} = require("../controllers/location");


function createLocationRouter(io){
    const Router = express.Router();
    const handleUpdateLocationIO = createUpdateLocationHandler(io);
    Router.post('/location-update',handleUpdateLocationIO);
    return Router;
}
module.exports = createLocationRouter;