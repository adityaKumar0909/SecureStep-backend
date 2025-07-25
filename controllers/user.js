const { customAlphabet } = require('nanoid');
const User = require("../models/user");
const {json} = require("express");

// Only letters + numbers (uppercase + lowercase)
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateUID = customAlphabet(alphabet, 8);

async function getUID(req, res) {
 console.log("We got a request asking for new UID allocation");
 const uniqueID = generateUID();
 return res.status(201).json({ id: uniqueID });
}

async function setCoordinates(req,res){
 console.log("We got a some new coordinates");
 const {uuid,lat,lon} = req.body;
 console.log(uuid,lat,lon);
 return res.status(201).json({ msg: "success" });
}

async function createNewUser(req,res){
 console.log("We got a new user");
 if(!req.body.name || !req.body.email || !req.body.uuid) return json.status(400).json({msg:"Missing fields"});
 const{name , email , uuid} = req.body;
 const newUser = new User({
  uuid:uuid,
  name:name,
  email:email,
 });

 await newUser.save();
 return res.status(201).json({msg:"success !"});
}

async function handleEmergencyContacts(req,res){
 console.log("We got a new list of emergency contact");
 if(!req.body.emergencyContacts || !req.body.uuid) return json.status(400).json({msg:"Missing fields"});
 const{emergencyContacts,uuid} = req.body;
 try {
  const user = await User.findOne({uuid});
  if (!user) return res.status(404).json({msg: "User not found"});

  user.emergencyContacts = emergencyContacts;
  await user.save();

  return res.status(200).json({msg: "success in updating emergency contacts !"});
 }catch(err){
  return res.status(500).json({msg: "Internal server error"});
 }


}

async function handleUpdateUserProfile(req,res){
 console.log("We got a new req for user profile update");
 if(!req.body.name || !req.body.email || !req.body.emergencyContacts ||!req.body.uuid) return res.status(400).json({msg:"Missing fields"});
 let {uuid,name , email , emergencyContacts} = req.body;
 name  = name.trim();
 email = email.trim();
 console.log(uuid,name,email,emergencyContacts);
 try{

  const user = await User.findOne({uuid});
  //User not seen before in database, create this profile
  if(!user){
   const newUser = new User({
    uuid:uuid,
    name:name,
    email:email,
    emergencyContacts:emergencyContacts,
   });

   await newUser.save();
   console.log("🆕 New user created");
   return res.status(201).json({ msg: "User created successfully" });
  }else {
   // If user exists, update the info
   user.name = name;
   user.email = email;
   user.emergencyContacts = emergencyContacts;

   await user.save();
   console.log("♻️ Existing user updated");
   return res.status(200).json({ msg: "User updated successfully" });
  }


 }catch (err) {
  console.error("❌ Error in user profile update:", err);
  return res.status(500).json({ msg: "Internal server error" });
 }
}

module.exports = { getUID , setCoordinates , createNewUser,handleEmergencyContacts,handleUpdateUserProfile};