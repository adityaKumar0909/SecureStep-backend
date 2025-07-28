require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectToDatabase = require('./connection');
const { userRouter } = require('./routes/user');
const redisClient = require("./redisClient");


require('./jobs/cron-jobs')
const {createUpdateLocationHandler} = require("./controllers/location");

connectToDatabase(process.env.MONGODB_URI);


const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const server = http.createServer(app);
const io = new Server(server,{
    cors:{origin:'*'}
});

//Web socket connection
io.on('connection', (socket) => {
    console.log(`🧩 User connected : ${socket.id}`);

    // //Join room
    // socket.on('join-room',(roomCode)=>{
    //    socket.join(roomCode);
    //    console.log(` 👥 User joined room : ${roomCode}`);
    // });
    socket.on('join-room', async (roomCode) => {
        socket.join(roomCode);
        console.log(` 👥 User joined room : ${roomCode}`);

        // Fetch last known location from Redis
        const location = await redisClient.get(`location:${roomCode}`);
        if (location) {
            socket.emit("receive-location", {
                userId: roomCode,
                location: JSON.parse(location)
            });
        }
    });

    //disconnect
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected : ${socket.id}`);
    });
});

//Inject 'io' to our location router
const locationRouter = createUpdateLocationHandler(io);
app.use('/user', userRouter);
app.use('/location',locationRouter)

server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server + Socket.IO running at port ${PORT}`);
});
