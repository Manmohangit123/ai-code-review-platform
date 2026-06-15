require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authController = require('./controllers/auth.controller');
const authMiddleware = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

// Auth routes
app.get('/auth/github', authController.initiateOAuth);
app.get('/auth/github/callback', authController.handleCallback);
app.post('/auth/refresh', authController.refreshToken);
app.post('/auth/logout', authController.logout);
app.get('/auth/me', authMiddleware, authController.getMe);

app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
});
