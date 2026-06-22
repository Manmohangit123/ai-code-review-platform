require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authController = require('./controllers/auth.controller');
const authMiddleware = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: { error: 'Too many requests, please try again later.' } });
app.use('/auth', authLimiter);

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
