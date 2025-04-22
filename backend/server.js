const cors = require('cors');

// Configure CORS
app.use(cors({
    origin: [
        'https://aramove.onrender.com',
        'http://localhost:3000' // For local development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); 