import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getStats } from '../services/analytics'

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const stats = getStats()

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    const kpis = [
        { label: 'Total Scans', value: stats?.total ?? 0, icon: '🔍', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: 'Avg Score', value: stats?.avgScore ? `${stats.avgScore}/100` : '—', icon: '⭐', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
        { label: 'Code Reviews', value: stats?.byType?.review ?? 0, icon: '🤖', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { label: 'Security Scans', value: stats?.byType?.security ?? 0, icon: '🛡️', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        { label: 'Perf Scans', value: stats?.byType?.performance ?? 0, icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    ]

    const quickActions = [
        { label: 'Analyze Repository', desc: 'Run AI code review on any repo', icon: '🔍', action: () => navigate('/repos'), color: '#6366f1' },
        { label: 'View Analytics', desc: 'See your score trends and history', icon: '📊', action: () => navigate('/analytics'), color: '#22c55e' },
        { label: 'Browse Repos', desc: 'Connect and manage repositories', icon: '📁', action: () => navigate('/repos'), color: '#3b82f6' },
    ]

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div>
                    <div style={s.greeting}>{greeting}, {user?.username} 👋</div>
                    <div style={s.headerSub}>Here's your AI code review overview</div>
                </div>
                <button style={s.primaryBtn} onClick={() => navigate('/repos')}>
                    + Start New Review
                </button>
            </div>

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

            <div style={s.grid2}>
                {/* Quick Actions */}
                <div style={s.card}>
                    <div style={s.cardHeader}>
                        <div>
                            <div style={s.cardTitle}>Quick Actions</div>
                            <div style={s.cardSub}>Jump right in</div>
                        </div>
                    </div>
                    <div style={s.actionList}>
                        {quickActions.map((a, i) => (
                            <div key={i} style={s.actionItem} onClick={a.action}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ ...s.actionIcon, background: `${a.color}18`, color: a.color }}>{a.icon}</div>
                                <div>
                                    <div style={s.actionLabel}>{a.label}</div>
                                    <div style={s.actionDesc}>{a.desc}</div>
                                </div>
                                <span style={s.actionArrow}>→</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={s.card}>
                    <div style={s.cardHeader}>
                        <div style={s.cardTitle}>Recent Activity</div>
                        <span style={s.viewAll} onClick={() => navigate('/analytics')}>View all →</span>
                    </div>
                    {!stats || stats.history.length === 0 ? (
                        <div style={s.empty}>
                            <div style={s.emptyIcon}>🔍</div>
                            <div style={s.emptyText}>No scans yet</div>
                            <div style={s.emptyDesc}>Run your first code review to see activity here</div>
                        </div>
                    ) : (
                        <div style={s.activityList}>
                            {stats.history.slice(0, 6).map((h, i) => (
                                <div key={i} style={s.activityItem}>
                                    <div style={{ ...s.activityDot, background: h.type === 'review' ? '#6366f1' : h.type === 'security' ? '#ef4444' : '#f59e0b' }} />
                                    <div style={s.activityContent}>
                                        <div style={s.activityFile}>{h.file?.split('/').pop()}</div>
                                        <div style={s.activityMeta}>{h.repo} · {h.type}</div>
                                    </div>
                                    <div style={{ ...s.activityScore, color: h.score >= 80 ? '#22c55e' : h.score >= 60 ? '#f59e0b' : '#ef4444' }}>
                                        {h.score != null ? `${h.score}` : '—'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Feature Banner */}
            <div style={s.banner}>
                <div>
                    <div style={s.bannerTitle}>🚀 AI-Powered Code Intelligence</div>
                    <div style={s.bannerDesc}>Detect bugs, security vulnerabilities, and performance issues instantly using local AI — no data leaves your machine.</div>
                    <div style={s.featureList}>
                        {['Code Review', 'Security Scan', 'Performance Analysis', 'README Generator', 'PR Analysis'].map((f, i) => (
                            <span key={i} style={s.featureTag}>{f}</span>
                        ))}
                    </div>
                </div>
                <button style={s.bannerBtn} onClick={() => navigate('/repos')}>Get Started →</button>
            </div>
        </div>
    )
}

const s = {
    page: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' },
    greeting: { fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
    headerSub: { fontSize: '14px', color: 'var(--text-secondary)' },
    primaryBtn: { background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' },

    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' },
    kpiCard: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' },
    kpiIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 12px' },
    kpiValue: { fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' },
    kpiLabel: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },

    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
    card: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
    cardTitle: { fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' },
    cardSub: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
    viewAll: { fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' },

    actionList: { display: 'flex', flexDirection: 'column', gap: '4px' },
    actionItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' },
    actionIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
    actionLabel: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' },
    actionDesc: { fontSize: '12px', color: 'var(--text-muted)' },
    actionArrow: { color: 'var(--text-muted)', marginLeft: 'auto' },

    activityList: { display: 'flex', flexDirection: 'column' },
    activityItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' },
    activityDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
    activityContent: { flex: 1, overflow: 'hidden' },
    activityFile: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    activityMeta: { fontSize: '11px', color: 'var(--text-muted)' },
    activityScore: { fontSize: '14px', fontWeight: '700', flexShrink: 0 },

    empty: { textAlign: 'center', padding: '32px 0' },
    emptyIcon: { fontSize: '36px', marginBottom: '8px' },
    emptyText: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' },
    emptyDesc: { fontSize: '12px', color: 'var(--text-muted)' },

    banner: { background: 'linear-gradient(135deg, #0f0f1a, #13131f)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' },
    bannerTitle: { fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' },
    bannerDesc: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', maxWidth: '480px', lineHeight: '1.6' },
    featureList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    featureTag: { background: 'var(--primary-subtle)', color: 'var(--text-accent)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '500' },
    bannerBtn: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 28px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 0 24px rgba(99,102,241,0.35)' },
}
