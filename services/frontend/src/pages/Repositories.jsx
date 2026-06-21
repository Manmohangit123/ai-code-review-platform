import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRepos } from '../services/api'

const langColors = { JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219', Go: '#00ADD8', CSS: '#563d7c', HTML: '#e34c26', Rust: '#dea584', Ruby: '#701516' }

export default function Repositories() {
    const [repos, setRepos] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        getRepos()
            .then(res => setRepos(res.data.repos))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const filtered = repos.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'all' || (filter === 'public' && !r.private) || (filter === 'private' && r.private)
        return matchSearch && matchFilter
    })

    if (loading) return (
        <div style={s.center}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Loading repositories...</p>
        </div>
    )

    if (error) return <div style={s.center}><p style={s.errorText}>Error: {error}</p></div>

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div>
                    <h2 style={s.title}>Repositories</h2>
                    <p style={s.subtitle}>{repos.length} repositories connected</p>
                </div>
            </div>

            {/* Toolbar */}
            <div style={s.toolbar}>
                <div style={s.searchWrap}>
                    <span style={s.searchIcon}>🔍</span>
                    <input
                        style={s.search}
                        placeholder="Search repositories..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={s.filters}>
                    {['all', 'public', 'private'].map(f => (
                        <button key={f} style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div style={s.grid}>
                {filtered.map(repo => (
                    <div
                        key={repo.id}
                        style={s.card}
                        onClick={() => navigate(`/repos/${repo.full_name}`)}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                        <div style={s.cardTop}>
                            <div style={s.repoIcon}>📁</div>
                            <span style={repo.private ? s.badgePrivate : s.badgePublic}>
                                {repo.private ? '🔒 Private' : '🌐 Public'}
                            </span>
                        </div>

                        <div style={s.repoName}>{repo.name}</div>

                        {repo.description ? (
                            <p style={s.desc}>{repo.description.slice(0, 80)}{repo.description.length > 80 ? '...' : ''}</p>
                        ) : (
                            <p style={s.noDesc}>No description</p>
                        )}

                        <div style={s.cardFooter}>
                            <div style={s.footerLeft}>
                                {repo.language && (
                                    <div style={s.langWrap}>
                                        <div style={{ ...s.langDot, background: langColors[repo.language] || '#8b949e' }} />
                                        <span style={s.lang}>{repo.language}</span>
                                    </div>
                                )}
                                <span style={s.stars}>★ {repo.stars}</span>
                            </div>
                            <span style={s.date}>{new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>

                        <div style={s.analyzeBar}>
                            <span style={s.analyzeText}>Click to analyze →</span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={s.empty}>
                    <div style={s.emptyIcon}>🔍</div>
                    <div style={s.emptyTitle}>No repositories found</div>
                    <div style={s.emptyDesc}>Try a different search term</div>
                </div>
            )}
        </div>
    )
}

const s = {
    page: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
    title: { fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
    subtitle: { fontSize: '13px', color: 'var(--text-secondary)' },

    toolbar: { display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' },
    searchWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '0 14px', flex: 1, maxWidth: '400px' },
    searchIcon: { fontSize: '14px', color: 'var(--text-muted)' },
    search: { background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', padding: '10px 0', outline: 'none', width: '100%' },

    filters: { display: 'flex', gap: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '4px' },
    filterBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
    filterBtnActive: { background: 'var(--bg-overlay)', color: 'var(--text-primary)' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
    card: {
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '20px',
        cursor: 'pointer', transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', gap: '8px',
    },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    repoIcon: { fontSize: '20px' },
    badgePublic: { fontSize: '11px', color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '2px 10px' },
    badgePrivate: { fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '2px 10px' },

    repoName: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' },
    desc: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 },
    noDesc: { fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' },

    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
    footerLeft: { display: 'flex', gap: '12px', alignItems: 'center' },
    langWrap: { display: 'flex', alignItems: 'center', gap: '6px' },
    langDot: { width: '10px', height: '10px', borderRadius: '50%' },
    lang: { fontSize: '12px', color: 'var(--text-secondary)' },
    stars: { fontSize: '12px', color: 'var(--text-muted)' },
    date: { fontSize: '11px', color: 'var(--text-muted)' },

    analyzeBar: { marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' },
    analyzeText: { fontSize: '12px', color: 'var(--primary)', fontWeight: '500' },

    center: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' },
    spinner: { width: '32px', height: '32px', border: '3px solid var(--border-default)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: 'var(--text-secondary)', fontSize: '14px' },
    errorText: { color: 'var(--danger)', fontSize: '15px' },

    empty: { textAlign: 'center', padding: '80px 40px' },
    emptyIcon: { fontSize: '48px', marginBottom: '16px' },
    emptyTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' },
    emptyDesc: { fontSize: '14px', color: 'var(--text-muted)' },
}
