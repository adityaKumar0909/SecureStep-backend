const express = require('express');
const {getUID,setCoordinates,createNewUser,handleEmergencyContacts,handleUpdateUserProfile} = require("../controllers/user");
const Router = express.Router();

Router.get('/getUID',getUID);
Router.post('/location-update',setCoordinates);
Router.post('/new-user',createNewUser);
Router.post('/emergency-contacts',handleEmergencyContacts);
Router.post('/updateUserProfile',handleUpdateUserProfile);
module.exports = {
    userRouter : Router,
}