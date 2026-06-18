import axios from 'axios';

const AUTH_URL = 'http://localhost:3001';
const GITHUB_URL = 'http://localhost:3002';

const getToken = () => localStorage.getItem('accessToken');

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

// Auth
export const getMe = () =>
    axios.get(`${AUTH_URL}/auth/me`, authHeaders());

// GitHub
export const getRepos = () =>
    axios.get(`${GITHUB_URL}/github/repos`, authHeaders());

export const getFileTree = (owner, repo) =>
    axios.get(`${GITHUB_URL}/github/repos/${owner}/${repo}/tree`, authHeaders());

export const getFileContent = (owner, repo, path) =>
    axios.get(`${GITHUB_URL}/github/repos/${owner}/${repo}/file`, {
        ...authHeaders(),
        params: { path }
    });

export const getPullRequests = (owner, repo) =>
    axios.get(`${GITHUB_URL}/github/repos/${owner}/${repo}/pulls`, authHeaders());

// AI Service
const AI_URL = 'http://localhost:8000';

export const analyzeCode = (file_path, code, language) =>
    axios.post(`${AI_URL}/ai/review`, { file_path, code, language }, { timeout: 120000 });
