const axios = require('axios');
const pool = require('../db');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../services/jwt.service');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Step 1: Redirect user to GitHub login page
exports.initiateOAuth = (req, res) => {
    const scope = 'read:user user:email repo';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${encodeURIComponent(scope)}`;
    res.redirect(githubAuthUrl);
};

// Step 2: GitHub redirects back here with a code — exchange it for a token
exports.handleCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${FRONTEND_URL}?error=no_code`);
    }

    try {
        // Exchange code for GitHub access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code
            },
            { headers: { Accept: 'application/json' } }
        );

        const { access_token, error } = tokenResponse.data;

        if (error || !access_token) {
            return res.redirect(`${FRONTEND_URL}?error=github_token_failed`);
        }

        // Fetch GitHub user profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const githubUser = userResponse.data;

        // Upsert user into database
        const result = await pool.query(
            `INSERT INTO users (github_id, username, email, avatar_url, github_access_token)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (github_id) DO UPDATE
             SET username = EXCLUDED.username,
                 email = EXCLUDED.email,
                 avatar_url = EXCLUDED.avatar_url,
                 github_access_token = EXCLUDED.github_access_token,
                 updated_at = NOW()
             RETURNING id, username, email, avatar_url, plan`,
            [
                String(githubUser.id),
                githubUser.login,
                githubUser.email || '',
                githubUser.avatar_url,
                access_token   // In production: encrypt this before storing
            ]
        );

        const user = result.rows[0];

        // Issue JWT tokens
        const tokenPayload = { userId: user.id, username: user.username };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Redirect to frontend with token in URL
        res.redirect(`${FRONTEND_URL}/auth/success?token=${accessToken}&refresh=${refreshToken}`);

    } catch (err) {
        console.error('OAuth callback error:', err.message);
        res.redirect(`${FRONTEND_URL}?error=server_error`);
    }
};

// Get current user from JWT
exports.getMe = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, avatar_url, plan, created_at FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Refresh access token
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
    }

    try {
        const payload = verifyToken(refreshToken);
        const newAccessToken = generateAccessToken({ userId: payload.userId, username: payload.username });
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
};

// Logout (client just discards tokens — stateless JWT)
exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};
