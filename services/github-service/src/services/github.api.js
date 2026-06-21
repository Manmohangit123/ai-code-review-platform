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

// Get pull requests with file diffs
exports.getPullRequests = async (accessToken, owner, repo) => {
    const octokit = createClient(accessToken);
    const prs = await octokit.paginate(octokit.rest.pulls.list, {
        owner, repo,
        state: 'open',
        per_page: 20
    });

    const detailed = await Promise.all(prs.map(async (pr) => {
        try {
            const { data: files } = await octokit.rest.pulls.listFiles({
                owner, repo,
                pull_number: pr.number,
                per_page: 10
            });
            return {
                number: pr.number,
                title: pr.title,
                user: pr.user.login,
                state: pr.state,
                created_at: pr.created_at,
                changed_files: pr.changed_files,
                additions: pr.additions,
                deletions: pr.deletions,
                html_url: pr.html_url,
                files: files.map(f => ({
                    filename: f.filename,
                    status: f.status,
                    additions: f.additions,
                    deletions: f.deletions,
                    patch: f.patch ? f.patch.slice(0, 3000) : ''
                }))
            };
        } catch {
            return {
                number: pr.number,
                title: pr.title,
                user: pr.user.login,
                state: pr.state,
                created_at: pr.created_at,
                changed_files: pr.changed_files,
                additions: pr.additions,
                deletions: pr.deletions,
                html_url: pr.html_url,
                files: []
            };
        }
    }));

    return detailed;
};
