const redis = require('redis');
const client = redis.createClient({
    url: process.env.REDIS_URL,
    socket:{
        tls:true,

    }
});

client.on('error', (err) => console.error("Redis error:", err));

client.connect();

client.on('connect', () => console.log("✨Redis connected✨"));



module.exports = client;
