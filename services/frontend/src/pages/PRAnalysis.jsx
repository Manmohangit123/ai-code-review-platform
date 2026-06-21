import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPullRequests, analyzeCode } from '../services/api'

const scoreColor = (score) => score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
const SEV_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', info: '#6b7280' }

export default function PRAnalysis() {
    const { owner, repo } = useParams()
    const navigate = useNavigate()
    const [prs, setPrs] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPR, setSelectedPR] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [report, setReport] = useState(null)
    const [error, setError] = useState(null)
    const [expandedFile, setExpandedFile] = useState(null)

    useEffect(() => {
        getPullRequests(owner, repo)
            .then(res => setPrs(res.data.pull_requests))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [owner, repo])

    const handleAnalyzePR = async (pr) => {
        setSelectedPR(pr)
        setAnalyzing(true)
        setReport(null)
        setError(null)
        setExpandedFile(null)

        try {
            const files = pr.files || []
            if (files.length === 0) {
                setError('This PR has no changed files to analyze.')
                setAnalyzing(false)
                return
            }

            const results = []
            for (const file of files.slice(0, 5)) {
                const ext = file.filename.split('.').pop()
                const langMap = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', java: 'java', go: 'go', css: 'css', html: 'html' }
                const language = langMap[ext] || 'text'
                try {
                    const res = await analyzeCode(file.filename, file.patch || '// No diff available', language)
                    results.push({ file: file.filename, status: file.status, additions: file.additions, deletions: file.deletions, result: res.data })
                } catch {
                    results.push({ file: file.filename, status: file.status, additions: file.additions, deletions: file.deletions, result: null })
                }
            }
            setReport({ pr, results })
            if (results.length > 0) setExpandedFile(0)
        } catch {
            setError('PR analysis failed. Make sure AI service is running.')
        } finally {
            setAnalyzing(false)
        }
    }

    const avgScore = report
        ? Math.round(report.results.filter(r => r.result?.overall_score).reduce((sum, r) => sum + r.result.overall_score, 0) / (report.results.filter(r => r.result?.overall_score).length || 1))
        : null

    const totalFindings = report
        ? report.results.reduce((sum, r) => sum + (r.result?.findings?.length || 0), 0)
        : 0

    if (loading) return (
        <div style={s.center}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Loading pull requests...</p>
        </div>
    )

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div>
                    <div style={s.breadcrumb}>
                        <span style={s.crumbLink} onClick={() => navigate('/repos')}>Repositories</span>
                        <span style={s.crumbSep}>/</span>
                        <span style={s.crumbLink} onClick={() => navigate(`/repos/${owner}/${repo}`)}>{repo}</span>
                        <span style={s.crumbSep}>/</span>
                        <span style={s.crumbActive}>PR Analysis</span>
                    </div>
                    <h2 style={s.title}>🔀 Pull Request Analysis</h2>
                    <p style={s.subtitle}>AI reviews all changed files in a pull request</p>
                </div>
            </div>

            {error && (
                <div style={s.errorBox}>
                    <span>❌</span>
                    <span style={s.errorText}>{error}</span>
                </div>
            )}

            <div style={s.layout}>
                {/* Left: PR List */}
                <div style={s.sidebar}>
                    <div style={s.sidebarHeader}>
                        <span style={s.sidebarTitle}>Open PRs</span>
                        <span style={s.prCount}>{prs.length}</span>
                    </div>

                    {prs.length === 0 ? (
                        <div style={s.emptyPRs}>
                            <div style={s.emptyPRIcon}>🔀</div>
                            <div style={s.emptyPRText}>No open pull requests</div>
                            <div style={s.emptyPRDesc}>Create a PR on GitHub to analyze it here</div>
                        </div>
                    ) : (
                        <div style={s.prList}>
                            {prs.map(pr => {
                                const isSelected = selectedPR?.number === pr.number
                                const isAnalyzing = analyzing && isSelected
                                return (
                                    <div
                                        key={pr.number}
                                        style={{ ...s.prCard, ...(isSelected ? s.prCardActive : {}) }}
                                        onClick={() => !analyzing && handleAnalyzePR(pr)}
                                    >
                                        <div style={s.prTop}>
                                            <span style={s.prNumber}>#{pr.number}</span>
                                            <span style={s.prStateBadge}>open</span>
                                        </div>
                                        <div style={s.prTitle}>{pr.title}</div>
                                        <div style={s.prMeta}>
                                            <span style={s.prMetaItem}>👤 {pr.user}</span>
                                            <span style={s.prMetaItem}>📁 {pr.changed_files} files</span>
                                        </div>
                                        <div style={s.prDiff}>
                                            <span style={s.additions}>+{pr.additions}</span>
                                            <span style={s.deletions}>-{pr.deletions}</span>
                                        </div>
                                        <button
                                            style={{ ...s.analyzeBtn, ...(isSelected ? s.analyzeBtnActive : {}), opacity: analyzing ? 0.6 : 1 }}
                                            disabled={analyzing}
                                        >
                                            {isAnalyzing ? (
                                                <><span style={s.btnSpinner} /> Analyzing...</>
                                            ) : isSelected && report ? (
                                                '🔄 Re-analyze'
                                            ) : (
                                                '🔍 Analyze PR'
                                            )}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Report */}
                <div style={s.reportArea}>
                    {/* Empty state */}
                    {!report && !analyzing && (
                        <div style={s.emptyReport}>
                            <div style={s.emptyReportIcon}>🔀</div>
                            <div style={s.emptyReportTitle}>Select a Pull Request</div>
                            <div style={s.emptyReportDesc}>Choose a PR from the left panel to start AI analysis of all changed files</div>
                            <div style={s.emptyReportFeatures}>
                                <div style={s.emptyFeature}><span style={{ color: '#6366f1' }}>✓</span> Code quality score per file</div>
                                <div style={s.emptyFeature}><span style={{ color: '#6366f1' }}>✓</span> Bug and issue detection</div>
                                <div style={s.emptyFeature}><span style={{ color: '#6366f1' }}>✓</span> Improvement suggestions</div>
                                <div style={s.emptyFeature}><span style={{ color: '#6366f1' }}>✓</span> Overall PR quality score</div>
                            </div>
                        </div>
                    )}

                    {/* Analyzing */}
                    {analyzing && (
                        <div style={s.analyzingBox}>
                            <div style={s.analyzingSpinner} />
                            <div style={s.analyzingTitle}>Analyzing PR #{selectedPR?.number}</div>
                            <div style={s.analyzingDesc}>AI is reviewing {selectedPR?.changed_files} changed file(s) in "{selectedPR?.title}"</div>
                        </div>
                    )}

                    {/* Report */}
                    {report && !analyzing && (
                        <div>
                            {/* Summary Bar */}
                            <div style={s.summaryBar}>
                                <div style={s.summaryLeft}>
                                    <div style={s.summaryTitle}>PR #{report.pr.number}: {report.pr.title}</div>
                                    <div style={s.summaryMeta}>by {report.pr.user} · {report.results.length} file(s) analyzed</div>
                                </div>
                                <div style={s.summaryStats}>
                                    {avgScore !== null && (
                                        <div style={s.statBox}>
                                            <div style={{ ...s.statValue, color: scoreColor(avgScore) }}>{avgScore}</div>
                                            <div style={s.statLabel}>Avg Score</div>
                                        </div>
                                    )}
                                    <div style={s.statBox}>
                                        <div style={{ ...s.statValue, color: totalFindings > 0 ? '#f59e0b' : '#22c55e' }}>{totalFindings}</div>
                                        <div style={s.statLabel}>Issues Found</div>
                                    </div>
                                    <div style={s.statBox}>
                                        <div style={s.statValue}>{report.results.length}</div>
                                        <div style={s.statLabel}>Files</div>
                                    </div>
                                </div>
                            </div>

                            {/* File Cards */}
                            {report.results.map((item, i) => (
                                <div key={i} style={s.fileCard}>
                                    {/* File Header */}
                                    <div style={s.fileHeader} onClick={() => setExpandedFile(expandedFile === i ? null : i)}>
                                        <div style={s.fileLeft}>
                                            <span style={s.fileIcon}>📄</span>
                                            <span style={s.fileName}>{item.file}</span>
                                            <span style={{
                                                ...s.statusBadge,
                                                background: item.status === 'added' ? 'rgba(34,197,94,0.15)' : item.status === 'removed' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                                                color: item.status === 'added' ? '#22c55e' : item.status === 'removed' ? '#ef4444' : '#3b82f6',
                                            }}>{item.status}</span>
                                        </div>
                                        <div style={s.fileRight}>
                                            <span style={s.additions}>+{item.additions}</span>
                                            <span style={s.deletions}>-{item.deletions}</span>
                                            {item.result?.overall_score != null && (
                                                <span style={{ ...s.fileScore, color: scoreColor(item.result.overall_score) }}>
                                                    {item.result.overall_score}/100
                                                </span>
                                            )}
                                            <span style={s.expandIcon}>{expandedFile === i ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedFile === i && (
                                        <div style={s.fileBody}>
                                            {!item.result ? (
                                                <div style={s.noResult}>Could not analyze this file.</div>
                                            ) : (
                                                <>
                                                    <div style={s.fileSummary}>{item.result.summary}</div>
                                                    {item.result.findings?.length > 0 ? (
                                                        <div style={s.findingsList}>
                                                            {item.result.findings.map((f, j) => (
                                                                <div key={j} style={s.finding}>
                                                                    <div style={{ ...s.sevDot, background: SEV_COLOR[f.severity] || '#6b7280' }} />
                                                                    <div style={s.findingContent}>
                                                                        <div style={s.findingTitle}>{f.title}</div>
                                                                        <div style={s.findingDesc}>{f.description}</div>
                                                                    </div>
                                                                    <div style={{ ...s.sevBadge, color: SEV_COLOR[f.severity] || '#6b7280', background: (SEV_COLOR[f.severity] || '#6b7280') + '18' }}>
                                                                        {f.severity}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={s.noIssues}>✅ No issues found in this file</div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const s = {
    page: { padding: '40px', maxWidth: '1300px', margin: '0 auto' },
    header: { marginBottom: '28px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
    crumbLink: { color: 'var(--primary)', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: 'var(--text-muted)', fontSize: '13px' },
    crumbActive: { color: 'var(--text-primary)', fontSize: '13px' },
    title: { fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px' },
    subtitle: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },

    errorBox: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
    errorText: { fontSize: '13px', color: 'var(--danger)' },

    layout: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' },

    sidebar: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
    sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' },
    sidebarTitle: { fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    prCount: { background: 'var(--primary-subtle)', color: 'var(--text-accent)', fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },

    emptyPRs: { padding: '40px 20px', textAlign: 'center' },
    emptyPRIcon: { fontSize: '36px', marginBottom: '12px' },
    emptyPRText: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' },
    emptyPRDesc: { fontSize: '12px', color: 'var(--text-muted)' },

    prList: { padding: '12px' },
    prCard: { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '10px', cursor: 'pointer', transition: 'var(--transition)' },
    prCardActive: { border: '1px solid var(--primary)', background: 'var(--primary-subtle)' },
    prTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
    prNumber: { fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' },
    prStateBadge: { background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
    prTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' },
    prMeta: { display: 'flex', gap: '10px', marginBottom: '8px' },
    prMetaItem: { fontSize: '11px', color: 'var(--text-muted)' },
    prDiff: { display: 'flex', gap: '8px', marginBottom: '10px' },
    additions: { fontSize: '12px', fontWeight: '700', color: '#22c55e' },
    deletions: { fontSize: '12px', fontWeight: '700', color: '#ef4444' },
    analyzeBtn: { width: '100%', background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
    analyzeBtnActive: { background: 'var(--primary)', color: 'white', border: '1px solid var(--primary)' },
    btnSpinner: { width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' },

    reportArea: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', minHeight: '500px', overflow: 'hidden' },

    emptyReport: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' },
    emptyReportIcon: { fontSize: '52px', marginBottom: '16px' },
    emptyReportTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' },
    emptyReportDesc: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px' },
    emptyReportFeatures: { display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' },
    emptyFeature: { fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' },

    analyzingBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' },
    analyzingSpinner: { width: '48px', height: '48px', border: '3px solid var(--border-default)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '20px' },
    analyzingTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' },
    analyzingDesc: { fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '360px' },

    summaryBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', gap: '16px', flexWrap: 'wrap' },
    summaryLeft: {},
    summaryTitle: { fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
    summaryMeta: { fontSize: '12px', color: 'var(--text-muted)' },
    summaryStats: { display: 'flex', gap: '24px' },
    statBox: { textAlign: 'center' },
    statValue: { fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 },
    statLabel: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },

    fileCard: { border: 'none', borderBottom: '1px solid var(--border-subtle)' },
    fileHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', cursor: 'pointer', transition: 'var(--transition)' },
    fileLeft: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' },
    fileIcon: { fontSize: '14px', flexShrink: 0 },
    fileName: { fontSize: '13px', fontWeight: '600', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    statusBadge: { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 },
    fileRight: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
    fileScore: { fontSize: '13px', fontWeight: '800' },
    expandIcon: { color: 'var(--text-muted)', fontSize: '12px' },

    fileBody: { padding: '16px 24px 20px', background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)' },
    fileSummary: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.6' },
    findingsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    finding: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' },
    sevDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '4px' },
    findingContent: { flex: 1 },
    findingTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' },
    findingDesc: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' },
    sevBadge: { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', flexShrink: 0, textTransform: 'uppercase' },
    noIssues: { fontSize: '13px', color: '#22c55e', fontWeight: '600' },
    noResult: { fontSize: '13px', color: 'var(--text-muted)' },

    center: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' },
    spinner: { width: '32px', height: '32px', border: '3px solid var(--border-default)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: 'var(--text-secondary)', fontSize: '14px' },
}
