const express = require('express');
const connectDB = require('./config/db')

// connect db
connectDB()


const PORT = process.env.PORT || 5000;

const app = express();

app.get('/', (req, res) => res.send('API is running...'))

app.listen(PORT, () => console.log(`This app started on port ${PORT}`))