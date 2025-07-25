require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./connection');
const { userRouter } = require('./routes/user');
const {locationRouter} = require("./routes/location");

require('./jobs/cron-jobs')

connectToDatabase(process.env.MONGODB_URI);

// const { alertRouter } = require('./routes/alert');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// app.use('/alert', alertRouter);
app.use('/user', userRouter);
app.use('/location',locationRouter)

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running at port ${PORT}`);
});
