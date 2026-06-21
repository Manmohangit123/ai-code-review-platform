import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFileTree } from '../services/api'

const FILE_ICONS = { js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️', py: '🐍', css: '🎨', html: '🌐', json: '📋', md: '📝', sql: '🗄️', go: '🐹', java: '☕', sh: '⚙️', yml: '⚙️', yaml: '⚙️', env: '🔐', gitignore: '🚫' }
const getIcon = (path) => FILE_ICONS[path.split('.').pop()] || '📄'
const getFolder = (path) => path.includes('/') ? path.split('/')[0] : ''

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

    const filtered = tree.filter(f => f.path.toLowerCase().includes(search.toLowerCase()))

    // Group files by folder
    const grouped = filtered.reduce((acc, file) => {
        const folder = getFolder(file.path) || '/'
        if (!acc[folder]) acc[folder] = []
        acc[folder].push(file)
        return acc
    }, {})

    const totalSize = tree.reduce((sum, f) => sum + (f.size || 0), 0)

    const actions = [
        { label: '📝 README', desc: 'Generate README.md', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', path: 'readme' },
        { label: '🔀 PR Analysis', desc: 'Review pull requests', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', path: 'pulls' },
    ]

    if (loading) return (
        <div style={s.center}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Loading repository...</p>
        </div>
    )
    if (error) return <div style={s.center}><p style={s.errorText}>Error: {error}</p></div>

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div>
                    <div style={s.breadcrumb}>
                        <span style={s.crumbLink} onClick={() => navigate('/repos')}>Repositories</span>
                        <span style={s.crumbSep}>/</span>
                        <span style={s.crumbActive}>{owner}/{repo}</span>
                    </div>
                    <h2 style={s.title}>📁 {repo}</h2>
                    <div style={s.metaRow}>
                        <span style={s.metaItem}>📄 {tree.length} files</span>
                        <span style={s.metaDot}>·</span>
                        <span style={s.metaItem}>💾 {(totalSize / 1024).toFixed(1)} KB</span>
                        <span style={s.metaDot}>·</span>
                        <span style={s.metaItem}>📂 {Object.keys(grouped).length} folders</span>
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div style={s.actionGrid}>
                {actions.map((a, i) => (
                    <div key={i} style={{ ...s.actionCard, borderColor: a.color + '30' }}
                        onClick={() => navigate(`/repos/${owner}/${repo}/${a.path}`)}
                        onMouseEnter={e => e.currentTarget.style.background = a.bg}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                    >
                        <div style={{ ...s.actionIcon, color: a.color }}>{a.label.split(' ')[0]}</div>
                        <div>
                            <div style={s.actionLabel}>{a.label.slice(2)}</div>
                            <div style={s.actionDesc}>{a.desc}</div>
                        </div>
                        <span style={{ ...s.actionArrow, color: a.color }}>→</span>
                    </div>
                ))}

                {/* Quick Scan Card */}
                <div style={{ ...s.actionCard, borderColor: '#6366f130' }}>
                    <div style={{ ...s.actionIcon, color: '#6366f1' }}>🤖</div>
                    <div>
                        <div style={s.actionLabel}>AI Code Scan</div>
                        <div style={s.actionDesc}>Click any file to scan</div>
                    </div>
                    <span style={{ ...s.actionArrow, color: '#6366f1' }}>↓</span>
                </div>
            </div>

            {/* Toolbar */}
            <div style={s.toolbar}>
                <div style={s.searchWrap}>
                    <span style={s.searchIcon}>🔍</span>
                    <input
                        style={s.search}
                        placeholder="Search files..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <span style={s.clearSearch} onClick={() => setSearch('')}>✕</span>
                    )}
                </div>
                <span style={s.resultCount}>{filtered.length} of {tree.length} files</span>
            </div>

            {/* File Tree */}
            <div style={s.fileTree}>
                {/* Tree Header */}
                <div style={s.treeHeader}>
                    <span style={s.treeHeaderName}>Name</span>
                    <span style={s.treeHeaderSize}>Size</span>
                </div>

                {search ? (
                    // Flat list when searching
                    filtered.map((file, i) => (
                        <div
                            key={file.path}
                            style={{ ...s.fileRow, borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                            onClick={() => navigate(`/repos/${owner}/${repo}/file?path=${encodeURIComponent(file.path)}`)}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={s.fileIconEl}>{getIcon(file.path)}</span>
                            <span style={s.filePath}>{file.path}</span>
                            <span style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                            <span style={s.fileArrow}>→</span>
                        </div>
                    ))
                ) : (
                    // Grouped by folder
                    Object.entries(grouped).map(([folder, files]) => (
                        <div key={folder}>
                            {folder !== '/' && (
                                <div style={s.folderRow}>
                                    <span style={s.folderIcon}>📂</span>
                                    <span style={s.folderName}>{folder}</span>
                                    <span style={s.folderCount}>{files.length} files</span>
                                </div>
                            )}
                            {files.map((file, i) => (
                                <div
                                    key={file.path}
                                    style={{ ...s.fileRow, paddingLeft: folder !== '/' ? '36px' : '16px', borderBottom: '1px solid var(--border-subtle)' }}
                                    onClick={() => navigate(`/repos/${owner}/${repo}/file?path=${encodeURIComponent(file.path)}`)}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={s.fileIconEl}>{getIcon(file.path)}</span>
                                    <span style={s.filePath}>{folder !== '/' ? file.path.replace(folder + '/', '') : file.path}</span>
                                    <span style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                                    <span style={s.fileArrow}>→</span>
                                </div>
                            ))}
                        </div>
                    ))
                )}

                {filtered.length === 0 && (
                    <div style={s.empty}>
                        <div style={s.emptyIcon}>🔍</div>
                        <div style={s.emptyText}>No files match "{search}"</div>
                    </div>
                )}
            </div>
        </div>
    )
}

const s = {
    page: { padding: '40px', maxWidth: '1000px', margin: '0 auto' },

    header: { marginBottom: '24px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
    crumbLink: { color: 'var(--primary)', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: 'var(--text-muted)', fontSize: '13px' },
    crumbActive: { color: 'var(--text-primary)', fontSize: '13px' },
    title: { fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px' },
    metaRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    metaItem: { fontSize: '13px', color: 'var(--text-secondary)' },
    metaDot: { color: 'var(--text-muted)', fontSize: '13px' },

    actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' },
    actionCard: { background: 'var(--bg-surface)', border: '1px solid', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'var(--transition)' },
    actionIcon: { fontSize: '22px', flexShrink: 0 },
    actionLabel: { fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' },
    actionDesc: { fontSize: '12px', color: 'var(--text-muted)' },
    actionArrow: { marginLeft: 'auto', fontSize: '18px', fontWeight: '700', flexShrink: 0 },

    toolbar: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' },
    searchWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '0 14px', flex: 1, maxWidth: '400px' },
    searchIcon: { fontSize: '13px', color: 'var(--text-muted)' },
    search: { background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', padding: '10px 0', outline: 'none', width: '100%' },
    clearSearch: { color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', padding: '2px 4px' },
    resultCount: { fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' },

    fileTree: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
    treeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' },
    treeHeaderName: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    treeHeaderSize: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },

    folderRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' },
    folderIcon: { fontSize: '14px' },
    folderName: { fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', flex: 1 },
    folderCount: { fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-overlay)', padding: '2px 8px', borderRadius: '10px' },

    fileRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', cursor: 'pointer', transition: 'background 0.1s' },
    fileIconEl: { fontSize: '14px', flexShrink: 0 },
    filePath: { fontSize: '13px', color: 'var(--primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    fileSize: { fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 },
    fileArrow: { fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0, opacity: 0 },

    empty: { padding: '48px', textAlign: 'center' },
    emptyIcon: { fontSize: '36px', marginBottom: '12px' },
    emptyText: { fontSize: '14px', color: 'var(--text-muted)' },

    center: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' },
    spinner: { width: '32px', height: '32px', border: '3px solid var(--border-default)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: 'var(--text-secondary)', fontSize: '14px' },
    errorText: { color: 'var(--danger)', fontSize: '15px' },
}
