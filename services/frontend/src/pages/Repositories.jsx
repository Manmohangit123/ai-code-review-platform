import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRepos } from '../services/api'

export default function Repositories() {
    const [repos, setRepos] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        getRepos()
            .then(res => setRepos(res.data.repos))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const filtered = repos.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div style={styles.center}><p style={styles.loading}>Loading repositories...</p></div>
    if (error) return <div style={styles.center}><p style={styles.error}>Error: {error}</p></div>

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Your Repositories</h2>
                    <p style={styles.subtitle}>{repos.length} repositories found</p>
                </div>
                <input
                    style={styles.search}
                    placeholder="Search repositories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div style={styles.grid}>
                {filtered.map(repo => (
                    <div
                        key={repo.id}
                        style={styles.card}
                        onClick={() => navigate(`/repos/${repo.full_name}`)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#58a6ff'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
                    >
                        <div style={styles.cardTop}>
                            <span style={styles.repoName}>{repo.name}</span>
                            <span style={repo.private ? styles.badgePrivate : styles.badgePublic}>
                                {repo.private ? 'Private' : 'Public'}
                            </span>
                        </div>
                        {repo.description && (
                            <p style={styles.desc}>{repo.description}</p>
                        )}
                        <div style={styles.cardBottom}>
                            {repo.language && (
                                <span style={styles.lang}>{repo.language}</span>
                            )}
                            <span style={styles.stars}>★ {repo.stars}</span>
                            <span style={styles.date}>
                                {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={styles.empty}>
                    <p style={styles.emptyText}>No repositories match "{search}"</p>
                </div>
            )}
        </div>
    )
}

const styles = {
    container: { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
    title: { color: '#e6edf3', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' },
    subtitle: { color: '#8b949e', fontSize: '13px', margin: 0 },
    search: { background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', padding: '8px 14px', fontSize: '14px', width: '260px', outline: 'none' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
    card: { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    repoName: { color: '#58a6ff', fontSize: '16px', fontWeight: '600' },
    badgePublic: { background: '#1f6feb22', color: '#58a6ff', border: '1px solid #1f6feb', borderRadius: '20px', padding: '2px 10px', fontSize: '11px' },
    badgePrivate: { background: '#6e768144', color: '#8b949e', border: '1px solid #6e7681', borderRadius: '20px', padding: '2px 10px', fontSize: '11px' },
    desc: { color: '#8b949e', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' },
    cardBottom: { display: 'flex', gap: '16px', alignItems: 'center' },
    lang: { color: '#e6edf3', fontSize: '12px', background: '#21262d', padding: '2px 8px', borderRadius: '4px' },
    stars: { color: '#8b949e', fontSize: '12px' },
    date: { color: '#6e7681', fontSize: '12px', marginLeft: 'auto' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' },
    loading: { color: '#58a6ff', fontSize: '16px' },
    error: { color: '#f85149', fontSize: '16px' },
    empty: { textAlign: 'center', padding: '48px' },
    emptyText: { color: '#8b949e', fontSize: '15px' }
}
