const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS - Place this BEFORE your routes
app.use(cors({
    origin: [
        'https://aramove.onrender.com',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Make sure you have these middleware configurations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... rest of your routes and configurations ... 