import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const mongoUrl = process.env.MONGO_CONN;

mongoose.connect(mongoUrl)
    .then(() => {
        console.log('MongoDB Connected...');
    })
    .catch((err) => {
        console.error('MongoDB Connection Error:', err);
    });
