import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFileTree } from '../services/api'

export default function RepoDetail() {
    const { owner, repo } = useParams()
    const [tree, setTree] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        getFileTree(owner, repo)
            .then(res => setTree(res.data.tree))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [owner, repo])

    const filtered = tree.filter(f =>
        f.path.toLowerCase().includes(search.toLowerCase())
    )

    const getFileIcon = (path) => {
        const ext = path.split('.').pop()
        const icons = { js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️', py: '🐍', css: '🎨', html: '🌐', json: '📋', md: '📝', sql: '🗄️' }
        return icons[ext] || '📄'
    }

    if (loading) return <div style={styles.center}><p style={styles.loading}>Loading file tree...</p></div>
    if (error) return <div style={styles.center}><p style={styles.error}>Error: {error}</p></div>

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.breadcrumb}>
                    <span style={styles.crumbLink} onClick={() => navigate('/repos')}> Repositories</span>
                    <span style={styles.crumbSep}>/</span>
                    <span style={styles.crumbActive}>{owner}/{repo}</span>
                </div>
                <h2 style={styles.title}>{repo}</h2>
                <p style={styles.subtitle}>{tree.length} files</p>
            </div>

            <div style={styles.toolbar}>
                <input
                    style={styles.search}
                    placeholder="Search files..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div style={styles.fileList}>
                {filtered.map(file => (
                    <div
                        key={file.path}
                        style={styles.fileRow}
                        onClick={() => navigate(`/repos/${owner}/${repo}/file?path=${encodeURIComponent(file.path)}`)}
                        onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <span style={styles.fileIcon}>{getFileIcon(file.path)}</span>
                        <span style={styles.filePath}>{file.path}</span>
                        <span style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const styles = {
    container: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
    crumbLink: { color: '#58a6ff', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: '#6e7681', fontSize: '13px' },
    crumbActive: { color: '#e6edf3', fontSize: '13px' },
    title: { color: '#e6edf3', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' },
    subtitle: { color: '#8b949e', fontSize: '13px', margin: 0 },
    toolbar: { marginBottom: '16px' },
    search: { background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', padding: '8px 14px', fontSize: '14px', width: '300px', outline: 'none' },
    fileList: { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', overflow: 'hidden' },
    fileRow: { display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #21262d', cursor: 'pointer', transition: 'background 0.15s' },
    fileIcon: { marginRight: '10px', fontSize: '14px' },
    filePath: { color: '#58a6ff', fontSize: '13px', flex: 1 },
    fileSize: { color: '#6e7681', fontSize: '11px' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' },
    loading: { color: '#58a6ff', fontSize: '16px' },
    error: { color: '#f85149', fontSize: '16px' }
}
