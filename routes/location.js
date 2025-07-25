const express = require('express');
const User = require("../models/user");
const {handleUpdateLocation} = require("../controllers/location");
const Router = express.Router();

Router.post('/location-update',handleUpdateLocation);

module.exports = {
    locationRouter : Router,
}