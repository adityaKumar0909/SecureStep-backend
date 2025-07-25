const mongoose = require('mongoose');

async function connectToDatabase( URI){
    try{
        await mongoose.connect(URI,
            {  useUnifiedTopology:true}
    );
        console.log('✅ Connected to MongoDb Atlas ');

    }catch(err){
        console.error("❌ MongoDB connection error:\", err");
    }
}

module.exports = connectToDatabase;