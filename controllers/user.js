const { customAlphabet } = require('nanoid');
const User = require("../models/user");
const {json} = require("express");
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');
const sendEmail = require("../utils/sendMail");


function generateUID() {
 const name = uniqueNamesGenerator({
  dictionaries: [adjectives, animals],
  separator: '',
  style: 'lowerCase',
 });

 const number = String(Math.floor(Math.random() * 100)).padStart(2, '0'); // 00-99
 return `${name}${number}`; // e.g. "sillypanda09"
}

// Only letters + numbers (uppercase + lowercase)
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// const newUID = generateUID();

async function getUID(req, res) {
 console.log("We got a request asking for new UID allocation");

 const uniqueID = generateUID();
 console.log(`dispatched ${uniqueID}`);
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

async function handleUpdateUserProfile(req, res) {
 console.log("👤 We got a new req for user profile update");

 let { uuid, name, email, emergencyContacts } = req.body;

 // Basic validation
 if (!name || !email || !emergencyContacts) {
  console.warn("⚠️ Missing fields in user profile update");
  return res.status(400).json({ msg: "Missing fields" });
 }

 // Clean inputs
 name = name.trim();
 email = email.trim();
 uuid = uuid?.trim() || generateUID(); // <-- Generate UUID if not provided

 console.log(`🔑 UUID: ${uuid}`);
 console.log(`📧 Email: ${email}`);
 console.log(`📞 Contacts: ${JSON.stringify(emergencyContacts)}`);

 try {
  let user = await User.findOne({ uuid });

  if (!user) {
   // New user
   const newUser = new User({
    uuid,
    name,
    email,
    emergencyContacts,
   });

   await newUser.save();
   console.log("🆕 New user created");
   console.log(`🆕 with UUID: ${uuid}`);
   return res.status(201).json({ msg: "User created successfully", uuid });
  } else {
   // Existing user
   user.name = name;
   user.email = email;
   user.emergencyContacts = emergencyContacts;

   await user.save();
   console.log("♻️ Existing user updated");
   return res.status(200).json({ msg: "User updated successfully", uuid });
  }
 } catch (err) {
  console.error("❌ Error in user profile update:", err);
  return res.status(500).json({ msg: "Internal server error" });
 }
}
async function sendAlerts(req,res){
 
 if(!req.body.uuid) return res.status(400).json({msg:"Missing fields"});
 //See if a user exists
 try {
  const user = await User.findOne({uuid: req.body.uuid});
  if (!user) return res.status(404).json({msg: "User not found"});
  //See if emergency contacts exist for that user
  if (!user.emergencyContacts.length) {
   console.log("No emergency contacts found for this user.");
   return res.status(403).json({msg: "No emergency contacts found for this user."});
  }

  for (const email of user.emergencyContacts) {
   await sendEmail(email, "Emergency Alert !", `Our app just triggered an emergency alert for you. Please check on ${user.name}.\n
            You can track them on your website https://secure-step-frontend.vercel.app with the tracking code ${req.body.uuid}`);
  }

  return res.status(200).json({msg:"success"});

 }
 catch(err){
  return res.status(500).json({msg:"Internal server error"});
 }


}

module.exports = { getUID , setCoordinates , createNewUser,handleEmergencyContacts,handleUpdateUserProfile,sendAlerts};