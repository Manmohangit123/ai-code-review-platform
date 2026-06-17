const { Octokit } = require('@octokit/rest');

const createClient = (accessToken) => new Octokit({ auth: accessToken });

// Get all repos for the authenticated user
exports.getUserRepos = async (accessToken) => {
    const octokit = createClient(accessToken);
    return octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
        per_page: 100,
        sort: 'updated'
    });
};

// Get file tree for a repo
exports.getFileTree = async (accessToken, owner, repo, branch = 'main') => {
    const octokit = createClient(accessToken);
    try {
        const { data } = await octokit.rest.git.getTree({
            owner, repo,
            tree_sha: branch,
            recursive: '1'
        });
        return data.tree.filter(item => item.type === 'blob');
    } catch {
        // Try 'master' if 'main' fails
        const { data } = await octokit.rest.git.getTree({
            owner, repo,
            tree_sha: 'master',
            recursive: '1'
        });
        return data.tree.filter(item => item.type === 'blob');
    }
};

// Get content of a single file
exports.getFileContent = async (accessToken, owner, repo, filePath) => {
    const octokit = createClient(accessToken);
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path: filePath });
    return {
        content: Buffer.from(data.content, 'base64').toString('utf8'),
        size: data.size,
        sha: data.sha
    };
};

// Get pull requests
exports.getPullRequests = async (accessToken, owner, repo) => {
    const octokit = createClient(accessToken);
    return octokit.paginate(octokit.rest.pulls.list, {
        owner, repo,
        state: 'open',
        per_page: 50
    });
};
