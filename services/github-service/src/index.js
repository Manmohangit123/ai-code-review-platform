require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middleware/auth.middleware');
const repoController = require('./controllers/repo.controller');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

const githubLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests, please try again later.' } });
app.use('/github', githubLimiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'github-service' }));

// All routes require JWT
app.use(authMiddleware);

app.get('/github/repos', repoController.listRepos);
app.get('/github/repos/:owner/:repo/tree', repoController.getFileTree);
app.get('/github/repos/:owner/:repo/file', repoController.getFileContent);
app.get('/github/repos/:owner/:repo/pulls', repoController.getPullRequests);

app.listen(PORT, () => console.log(`GitHub service running on port ${PORT}`));
