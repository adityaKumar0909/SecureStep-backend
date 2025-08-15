const express = require('express');
const {getUID,setCoordinates,createNewUser,handleEmergencyContacts,handleUpdateUserProfile,sendAlerts} = require("../controllers/user");
const User = require("../models/user");
const sendEmail = require("../utils/sendMail");
const Router = express.Router();

Router.get('/getUID',getUID);
Router.post('/location-update',setCoordinates);
Router.post('/new-user',createNewUser);
Router.post('/emergency-contacts',handleEmergencyContacts);
Router.post('/updateUserProfile',handleUpdateUserProfile);
Router.post('/send-alert',sendAlerts);
module.exports = {
    userRouter : Router,
}