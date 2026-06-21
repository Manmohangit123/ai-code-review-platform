import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats, clearHistory } from '../services/analytics'

const scoreColor = (score) => score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

export default function Analytics() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [refreshed, setRefreshed] = useState(0)

    useEffect(() => { setStats(getStats()) }, [refreshed])

    const handleClear = () => {
        if (window.confirm('Clear all review history?')) {
            clearHistory()
            setRefreshed(r => r + 1)
        }
    }

    const kpis = stats ? [
        { label: 'Total Scans', value: stats.total, icon: '🔍', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: 'Avg Score', value: `${stats.avgScore}/100`, icon: '⭐', color: scoreColor(stats.avgScore), bg: `${scoreColor(stats.avgScore)}18` },
        { label: 'Code Reviews', value: stats.byType.review, icon: '🤖', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: 'Security Scans', value: stats.byType.security, icon: '🛡️', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        { label: 'Perf Scans', value: stats.byType.performance, icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    ] : []

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div>
                    <h2 style={s.title}>📊 Analytics</h2>
                    <p style={s.subtitle}>Your AI code review history and score trends</p>
                </div>
                {stats && (
                    <button style={s.clearBtn} onClick={handleClear}>🗑️ Clear History</button>
                )}
            </div>

            {!stats ? (
                <div style={s.emptyBox}>
                    <div style={s.emptyIcon}>📊</div>
                    <div style={s.emptyTitle}>No review data yet</div>
                    <div style={s.emptyDesc}>Run code reviews, security scans, or performance scans to see your analytics here.</div>
                    <button style={s.goBtn} onClick={() => navigate('/repos')}>Browse Repositories →</button>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div style={s.kpiGrid}>
                        {kpis.map((k, i) => (
                            <div key={i} style={s.kpiCard}>
                                <div style={{ ...s.kpiIcon, background: k.bg, color: k.color }}>{k.icon}</div>
                                <div style={s.kpiValue}>{k.value}</div>
                                <div style={s.kpiLabel}>{k.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={s.row}>
                        {/* Score Trend Chart */}
                        {stats.trend.length > 0 && (
                            <div style={s.panel}>
                                <div style={s.panelHeader}>
                                    <div style={s.panelTitle}>📈 Score Trend</div>
                                    <div style={s.panelSub}>Last {stats.trend.length} scans</div>
                                </div>
                                <div style={s.chart}>
                                    {stats.trend.map((point, i) => (
                                        <div key={i} style={s.barCol}>
                                            <div style={s.barScore}>{point.score}</div>
                                            <div style={s.barOuter}>
                                                <div style={{
                                                    ...s.barInner,
                                                    height: `${point.score}%`,
                                                    background: `linear-gradient(to top, ${scoreColor(point.score)}, ${scoreColor(point.score)}99)`
                                                }} />
                                            </div>
                                            <div style={s.barLabel}>{point.file.slice(0, 7)}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* X axis line */}
                                <div style={s.chartAxis}>
                                    <span style={s.axisLabel}>0</span>
                                    <div style={s.axisLine} />
                                    <span style={s.axisLabel}>100</span>
                                </div>
                            </div>
                        )}

                        {/* Top Repos */}
                        {stats.topRepos.length > 0 && (
                            <div style={s.panel}>
                                <div style={s.panelHeader}>
                                    <div style={s.panelTitle}>🏆 Most Reviewed</div>
                                    <div style={s.panelSub}>Top repositories</div>
                                </div>
                                <div style={s.repoList}>
                                    {stats.topRepos.map((r, i) => (
                                        <div key={i} style={s.repoRow}>
                                            <div style={{ ...s.repoRank, color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#78716c' }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                            </div>
                                            <div style={s.repoInfo}>
                                                <div style={s.repoName}>{r.repo}</div>
                                                <div style={s.repoBarOuter}>
                                                    <div style={{
                                                        ...s.repoBarInner,
                                                        width: `${(r.count / stats.topRepos[0].count) * 100}%`,
                                                        background: i === 0 ? '#6366f1' : 'var(--border-strong)'
                                                    }} />
                                                </div>
                                            </div>
                                            <div style={s.repoCount}>{r.count} scans</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Scan Type Breakdown */}
                                <div style={s.breakdown}>
                                    <div style={s.breakdownTitle}>Scan Breakdown</div>
                                    <div style={s.breakdownBar}>
                                        {stats.byType.review > 0 && (
                                            <div style={{ ...s.breakdownSegment, flex: stats.byType.review, background: '#6366f1' }} title={`Review: ${stats.byType.review}`} />
                                        )}
                                        {stats.byType.security > 0 && (
                                            <div style={{ ...s.breakdownSegment, flex: stats.byType.security, background: '#ef4444' }} title={`Security: ${stats.byType.security}`} />
                                        )}
                                        {stats.byType.performance > 0 && (
                                            <div style={{ ...s.breakdownSegment, flex: stats.byType.performance, background: '#f59e0b' }} title={`Performance: ${stats.byType.performance}`} />
                                        )}
                                    </div>
                                    <div style={s.breakdownLegend}>
                                        <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#6366f1' }} />Review ({stats.byType.review})</span>
                                        <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#ef4444' }} />Security ({stats.byType.security})</span>
                                        <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#f59e0b' }} />Perf ({stats.byType.performance})</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* History Table */}
                    <div style={s.panel}>
                        <div style={s.panelHeader}>
                            <div style={s.panelTitle}>🕐 Review History</div>
                            <div style={s.panelSub}>Last {Math.min(stats.history.length, 20)} scans</div>
                        </div>
                        <div style={s.table}>
                            <div style={s.tableHead}>
                                <span style={s.c1}>Type</span>
                                <span style={s.c2}>File</span>
                                <span style={s.c3}>Repository</span>
                                <span style={s.c4}>Score</span>
                                <span style={s.c5}>Date</span>
                            </div>
                            {stats.history.slice(0, 20).map((h, i) => (
                                <div key={i} style={{ ...s.tableRow, background: i % 2 === 0 ? 'var(--bg-elevated)' : 'transparent' }}>
                                    <span style={s.c1}>
                                        <span style={{
                                            ...s.typeBadge,
                                            background: h.type === 'review' ? 'rgba(99,102,241,0.2)' : h.type === 'security' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                                            color: h.type === 'review' ? '#818cf8' : h.type === 'security' ? '#f87171' : '#fbbf24',
                                        }}>{h.type}</span>
                                    </span>
                                    <span style={s.c2}>{h.file?.split('/').pop() || '—'}</span>
                                    <span style={s.c3}>{h.repo}</span>
                                    <span style={{ ...s.c4, color: h.score != null ? scoreColor(h.score) : 'var(--text-muted)', fontWeight: '700' }}>
                                        {h.score != null ? `${h.score}/100` : h.severity || '—'}
                                    </span>
                                    <span style={s.c5}>{new Date(h.date).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

const s = {
    page: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },

    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
    title: { fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px' },
    subtitle: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },
    clearBtn: { background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' },

    emptyBox: { background: 'var(--bg-surface)', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '80px 40px', textAlign: 'center' },
    emptyIcon: { fontSize: '56px', marginBottom: '16px' },
    emptyTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' },
    emptyDesc: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: '1.6' },
    goBtn: { background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },

    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' },
    kpiCard: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' },
    kpiIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 12px' },
    kpiValue: { fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' },
    kpiLabel: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },

    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
    panel: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    panelTitle: { fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' },
    panelSub: { fontSize: '12px', color: 'var(--text-muted)' },

    chart: { display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px' },
    barCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 },
    barScore: { fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' },
    barOuter: { flex: 1, width: '100%', background: 'var(--bg-elevated)', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' },
    barInner: { width: '100%', borderRadius: '4px', transition: 'height 0.5s ease' },
    barLabel: { fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', overflow: 'hidden', width: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    chartAxis: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' },
    axisLabel: { fontSize: '10px', color: 'var(--text-muted)', width: '20px' },
    axisLine: { flex: 1, height: '1px', background: 'var(--border-subtle)' },

    repoList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
    repoRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    repoRank: { fontSize: '18px', width: '28px', flexShrink: 0 },
    repoInfo: { flex: 1 },
    repoName: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' },
    repoBarOuter: { height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' },
    repoBarInner: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
    repoCount: { fontSize: '12px', color: 'var(--text-muted)', width: '56px', textAlign: 'right', flexShrink: 0 },

    breakdown: { borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' },
    breakdownTitle: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    breakdownBar: { display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px', marginBottom: '10px' },
    breakdownSegment: { borderRadius: '2px', transition: 'flex 0.3s' },
    breakdownLegend: { display: 'flex', gap: '16px' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' },
    legendDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },

    table: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' },
    tableHead: { display: 'grid', gridTemplateColumns: '110px 1fr 130px 90px 100px', padding: '10px 16px', background: 'var(--bg-elevated)', gap: '8px', borderBottom: '1px solid var(--border-subtle)' },
    tableRow: { display: 'grid', gridTemplateColumns: '110px 1fr 130px 90px 100px', padding: '10px 16px', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' },
    c1: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' },
    c2: { fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    c3: { fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    c4: { fontSize: '13px' },
    c5: { fontSize: '11px', color: 'var(--text-muted)' },
    typeBadge: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
}
