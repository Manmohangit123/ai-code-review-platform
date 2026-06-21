const pool = require('../db');
const githubApi = require('../services/github.api');

// Get GitHub access token from DB for the logged-in user
const getAccessToken = async (userId) => {
    const result = await pool.query(
        'SELECT github_access_token FROM users WHERE id = $1',
        [userId]
    );
    if (result.rows.length === 0) throw new Error('User not found');
    return result.rows[0].github_access_token;
};

// List all repositories
exports.listRepos = async (req, res) => {
    try {
        const accessToken = await getAccessToken(req.user.userId);
        const repos = await githubApi.getUserRepos(accessToken);

        const simplified = repos.map(r => ({
            id: r.id,
            name: r.name,
            full_name: r.full_name,
            description: r.description,
            language: r.language,
            private: r.private,
            stars: r.stargazers_count,
            updated_at: r.updated_at,
            default_branch: r.default_branch,
            html_url: r.html_url
        }));

        res.json({ repos: simplified, total: simplified.length });
    } catch (err) {
        console.error('listRepos error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get file tree for a repo
exports.getFileTree = async (req, res) => {
    const { owner, repo } = req.params;
    try {
        const accessToken = await getAccessToken(req.user.userId);
        const tree = await githubApi.getFileTree(accessToken, owner, repo);
        res.json({ tree, total: tree.length });
    } catch (err) {
        console.error('getFileTree error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get file content
exports.getFileContent = async (req, res) => {
    const { owner, repo } = req.params;
    const filePath = req.query.path;

    if (!filePath) return res.status(400).json({ error: 'File path required' });

    try {
        const accessToken = await getAccessToken(req.user.userId);
        const file = await githubApi.getFileContent(accessToken, owner, repo, filePath);
        res.json(file);
    } catch (err) {
        console.error('getFileContent error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get pull requests
exports.getPullRequests = async (req, res) => {
    const { owner, repo } = req.params;
    try {
        const accessToken = await getAccessToken(req.user.userId);
        const pull_requests = await githubApi.getPullRequests(accessToken, owner, repo);
        res.json({ pull_requests, total: pull_requests.length });
    } catch (err) {
        console.error('getPullRequests error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
