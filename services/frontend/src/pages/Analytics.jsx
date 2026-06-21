import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats, clearHistory } from '../services/analytics'

export default function Analytics() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [refreshed, setRefreshed] = useState(0)

    useEffect(() => {
        setStats(getStats())
    }, [refreshed])

    const handleClear = () => {
        if (window.confirm('Clear all review history?')) {
            clearHistory()
            setRefreshed(r => r + 1)
        }
    }

    const scoreColor = (score) => score >= 80 ? '#3fb950' : score >= 60 ? '#d29922' : '#f85149'

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>📊 Analytics Dashboard</h2>
                    <p style={styles.subtitle}>Your AI code review history and score trends</p>
                </div>
                <button style={styles.clearBtn} onClick={handleClear}>🗑️ Clear History</button>
            </div>

            {!stats ? (
                <div style={styles.emptyBox}>
                    <p style={styles.emptyIcon}>📊</p>
                    <p style={styles.emptyTitle}>No review data yet</p>
                    <p style={styles.emptyText}>Run some code reviews, security scans, or performance scans to see your analytics here.</p>
                    <button style={styles.goBtn} onClick={() => navigate('/repos')}>Go to Repositories</button>
                </div>
            ) : (
                <div>
                    {/* Stat Cards */}
                    <div style={styles.cards}>
                        <div style={styles.card}>
                            <p style={styles.cardLabel}>Total Scans</p>
                            <p style={styles.cardValue}>{stats.total}</p>
                        </div>
                        <div style={styles.card}>
                            <p style={styles.cardLabel}>Average Score</p>
                            <p style={{ ...styles.cardValue, color: scoreColor(stats.avgScore) }}>{stats.avgScore}/100</p>
                        </div>
                        <div style={styles.card}>
                            <p style={styles.cardLabel}>Code Reviews</p>
                            <p style={{ ...styles.cardValue, color: '#3fb950' }}>{stats.byType.review}</p>
                        </div>
                        <div style={styles.card}>
                            <p style={styles.cardLabel}>Security Scans</p>
                            <p style={{ ...styles.cardValue, color: '#f85149' }}>{stats.byType.security}</p>
                        </div>
                        <div style={styles.card}>
                            <p style={styles.cardLabel}>Performance Scans</p>
                            <p style={{ ...styles.cardValue, color: '#d29922' }}>{stats.byType.performance}</p>
                        </div>
                    </div>

                    <div style={styles.row}>
                        {/* Score Trend */}
                        {stats.trend.length > 0 && (
                            <div style={styles.panel}>
                                <h3 style={styles.panelTitle}>📈 Score Trend (Last {stats.trend.length} scans)</h3>
                                <div style={styles.chart}>
                                    {stats.trend.map((point, i) => (
                                        <div key={i} style={styles.barWrapper}>
                                            <span style={styles.barScore}>{point.score}</span>
                                            <div style={styles.barOuter}>
                                                <div style={{ ...styles.barInner, height: `${point.score}%`, background: scoreColor(point.score) }} />
                                            </div>
                                            <span style={styles.barLabel}>{point.file.slice(0, 8)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Repos */}
                        {stats.topRepos.length > 0 && (
                            <div style={styles.panel}>
                                <h3 style={styles.panelTitle}>🏆 Most Reviewed Repos</h3>
                                {stats.topRepos.map((r, i) => (
                                    <div key={i} style={styles.repoRow}>
                                        <span style={styles.repoRank}>#{i + 1}</span>
                                        <span style={styles.repoName}>{r.repo}</span>
                                        <div style={styles.repoBarOuter}>
                                            <div style={{ ...styles.repoBarInner, width: `${(r.count / stats.topRepos[0].count) * 100}%` }} />
                                        </div>
                                        <span style={styles.repoCount}>{r.count} scans</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent History */}
                    <div style={styles.panel}>
                        <h3 style={styles.panelTitle}>🕐 Recent Review History</h3>
                        <div style={styles.historyTable}>
                            <div style={styles.tableHeader}>
                                <span style={styles.col1}>Type</span>
                                <span style={styles.col2}>File</span>
                                <span style={styles.col3}>Repo</span>
                                <span style={styles.col4}>Score</span>
                                <span style={styles.col5}>Date</span>
                            </div>
                            {stats.history.slice(0, 20).map((h, i) => (
                                <div key={i} style={{ ...styles.tableRow, background: i % 2 === 0 ? '#0d1117' : 'transparent' }}>
                                    <span style={styles.col1}>
                                        <span style={{ ...styles.typeBadge, background: h.type === 'review' ? '#238636' : h.type === 'security' ? '#b91c1c' : '#9e6a03' }}>
                                            {h.type}
                                        </span>
                                    </span>
                                    <span style={styles.col2}>{h.file?.split('/').pop() || '-'}</span>
                                    <span style={styles.col3}>{h.repo}</span>
                                    <span style={{ ...styles.col4, color: h.score ? scoreColor(h.score) : '#8b949e', fontWeight: '700' }}>
                                        {h.score != null ? `${h.score}/100` : h.severity || '-'}
                                    </span>
                                    <span style={styles.col5}>{new Date(h.date).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = {
    container: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
    title: { color: '#e6edf3', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' },
    subtitle: { color: '#8b949e', fontSize: '13px', margin: 0 },
    clearBtn: { background: '#21262d', color: '#f85149', border: '1px solid #f85149', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' },
    emptyBox: { background: '#161b22', border: '1px dashed #30363d', borderRadius: '12px', padding: '80px 40px', textAlign: 'center' },
    emptyIcon: { fontSize: '56px', margin: '0 0 16px' },
    emptyTitle: { color: '#e6edf3', fontSize: '20px', fontWeight: '700', margin: '0 0 8px' },
    emptyText: { color: '#8b949e', fontSize: '14px', margin: '0 0 24px' },
    goBtn: { background: '#1f6feb', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    cards: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' },
    card: { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '20px', textAlign: 'center' },
    cardLabel: { color: '#8b949e', fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    cardValue: { color: '#e6edf3', fontSize: '32px', fontWeight: '700', margin: 0 },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    panel: { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '20px', marginBottom: '24px' },
    panelTitle: { color: '#e6edf3', fontSize: '15px', fontWeight: '700', margin: '0 0 20px' },
    chart: { display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', paddingBottom: '24px' },
    barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 },
    barScore: { color: '#8b949e', fontSize: '11px' },
    barOuter: { flex: 1, width: '100%', background: '#21262d', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' },
    barInner: { width: '100%', borderRadius: '4px', transition: 'height 0.3s' },
    barLabel: { color: '#6e7681', fontSize: '10px', textAlign: 'center' },
    repoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
    repoRank: { color: '#8b949e', fontSize: '12px', fontWeight: '700', width: '24px' },
    repoName: { color: '#e6edf3', fontSize: '13px', width: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    repoBarOuter: { flex: 1, height: '8px', background: '#21262d', borderRadius: '4px', overflow: 'hidden' },
    repoBarInner: { height: '100%', background: '#1f6feb', borderRadius: '4px' },
    repoCount: { color: '#8b949e', fontSize: '12px', width: '60px', textAlign: 'right' },
    historyTable: { borderRadius: '8px', overflow: 'hidden', border: '1px solid #21262d' },
    tableHeader: { display: 'grid', gridTemplateColumns: '100px 1fr 120px 90px 100px', padding: '10px 16px', background: '#21262d', gap: '8px' },
    tableRow: { display: 'grid', gridTemplateColumns: '100px 1fr 120px 90px 100px', padding: '10px 16px', gap: '8px', alignItems: 'center' },
    col1: { color: '#8b949e', fontSize: '12px', fontWeight: '600' },
    col2: { color: '#e6edf3', fontSize: '12px' },
    col3: { color: '#8b949e', fontSize: '12px' },
    col4: { fontSize: '12px' },
    col5: { color: '#6e7681', fontSize: '11px' },
    typeBadge: { color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' },
}
