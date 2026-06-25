import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getFileContent, analyzeCode, scanSecurity, scanPerformance } from '../services/api'
import { saveReview } from '../services/analytics'

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp']

const isImage = (path) => IMAGE_EXTS.includes(path?.split('.').pop()?.toLowerCase())

const getLanguage = (path) => {
    const ext = path?.split('.').pop()
    const map = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', css: 'css', html: 'html', json: 'json', sql: 'sql', md: 'markdown' }
    return map[ext] || 'unknown'
}

const SEV = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', info: '#6b7280', none: '#22c55e' }
const CAT = { bug: '#ef4444', security: '#f97316', performance: '#f59e0b', style: '#3b82f6', complexity: '#8b5cf6', memory: '#f59e0b', database: '#ef4444', network: '#3b82f6', rendering: '#8b5cf6', bundle: '#6b7280' }

export default function FileViewer() {
    const { owner, repo } = useParams()
    const [searchParams] = useSearchParams()
    const filePath = searchParams.get('path')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState(null)
    const [scanning, setScanning] = useState(false)
    const [reports, setReports] = useState({ review: null, security: null, performance: null })
    const [scanError, setScanError] = useState(null)
    const [severityFilter, setSeverityFilter] = useState('all')
    const [expandedFindings, setExpandedFindings] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        if (!filePath) return
        getFileContent(owner, repo, filePath)
            .then(res => setFile(res.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [owner, repo, filePath])

    const runScan = async (type) => {
        setScanning(true)
        setActiveTab(type)
        setScanError(null)
        setSeverityFilter('all')
        setExpandedFindings({})
        try {
            let res
            const lang = getLanguage(filePath)
            if (type === 'review') res = await analyzeCode(filePath, file.content, lang)
            else if (type === 'security') res = await scanSecurity(filePath, file.content, lang)
            else if (type === 'performance') res = await scanPerformance(filePath, file.content, lang)
            setReports(prev => ({ ...prev, [type]: res.data }))
            const score = res.data?.overall_score ?? res.data?.performance_score ?? null
            const severity = res.data?.risk_level ?? null
            saveReview(type, repo, filePath, score, severity)
        } catch {
            setScanError(`${type} scan failed. Make sure AI service is running.`)
        } finally {
            setScanning(false)
        }
    }

    const getFindings = () => {
        const r = reports[activeTab]
        if (!r) return []
        if (activeTab === 'review') return r.findings || []
        if (activeTab === 'security') return r.vulnerabilities || []
        if (activeTab === 'performance') return r.issues || []
        return []
    }

    const filteredFindings = getFindings().filter(f => severityFilter === 'all' || f.severity === severityFilter)
    const toggleFinding = (i) => setExpandedFindings(prev => ({ ...prev, [i]: !prev[i] }))

    const getScore = () => {
        const r = reports[activeTab]
        if (!r) return null
        return r.overall_score ?? r.performance_score ?? null
    }

    const scoreColor = (score) => score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

    if (loading) return (
        <div style={s.center}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Loading file...</p>
        </div>
    )
    if (error) return <div style={s.center}><p style={s.errorText}>Error: {error}</p></div>

    const lines = file?.content?.split('\n') || []
    const currentReport = reports[activeTab]
    const score = getScore()

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
                        <span style={s.crumbActive}>{filePath?.split('/').pop()}</span>
                    </div>
                    <div style={s.fileMeta}>
                        <span style={s.metaBadge}>{getLanguage(filePath)}</span>
                        <span style={s.metaText}>{lines.length} lines</span>
                        <span style={s.metaDot}>·</span>
                        <span style={s.metaText}>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                </div>

                <div style={s.scanButtons}>
                    {[
                        { type: 'review', label: '🤖 Code Review', color: '#6366f1' },
                        { type: 'security', label: '🛡️ Security', color: '#ef4444' },
                        { type: 'performance', label: '⚡ Performance', color: '#f59e0b' },
                    ].map(btn => (
                        <button
                            key={btn.type}
                            style={{
                                ...s.scanBtn,
                                background: activeTab === btn.type ? btn.color : 'var(--bg-elevated)',
                                border: `1px solid ${activeTab === btn.type ? btn.color : 'var(--border-default)'}`,
                                color: activeTab === btn.type ? 'white' : 'var(--text-secondary)',
                                opacity: scanning ? 0.6 : 1,
                            }}
                            onClick={() => runScan(btn.type)}
                            disabled={scanning}
                        >
                            {scanning && activeTab === btn.type ? '⏳ Scanning...' : btn.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={s.layout}>
                {/* Code / Image Panel */}
                <div style={s.codePanel}>
                    <div style={s.codePanelHeader}>
                        <span style={s.fileName}>{isImage(filePath) ? '🖼️' : '📄'} {filePath?.split('/').pop()}</span>
                    </div>
                    {isImage(filePath) ? (
                        <div style={s.imageContainer}>
                            <img
                                src={`https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`}
                                alt={filePath?.split('/').pop()}
                                style={s.imagePreview}
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
                            />
                            <div style={{ display: 'none', color: 'var(--text-muted)', fontSize: '13px', padding: '20px', textAlign: 'center' }}>
                                Image could not be loaded. It may be on a different branch.
                            </div>
                        </div>
                    ) : (
                        <div style={s.codeContainer}>
                            <table style={s.table}>
                                <tbody>
                                    {lines.map((line, i) => (
                                        <tr key={i} style={s.row}>
                                            <td style={s.lineNum}>{i + 1}</td>
                                            <td style={s.lineCode}><pre style={s.pre}>{line || ' '}</pre></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Report Panel */}
                <div style={s.reportPanel}>
                    {!currentReport && !scanning && !scanError && (
                        <div style={s.emptyReport}>
                            <div style={s.emptyReportIcon}>🤖</div>
                            <div style={s.emptyReportTitle}>AI Analysis</div>
                            <div style={s.emptyReportDesc}>Select a scan type above to analyze this file with AI</div>
                            <div style={s.scanHints}>
                                <div style={s.scanHint}><span style={{ color: '#6366f1' }}>🤖</span> Code Review — bugs & quality</div>
                                <div style={s.scanHint}><span style={{ color: '#ef4444' }}>🛡️</span> Security — vulnerabilities</div>
                                <div style={s.scanHint}><span style={{ color: '#f59e0b' }}>⚡</span> Performance — bottlenecks</div>
                            </div>
                        </div>
                    )}

                    {scanning && (
                        <div style={s.scanningBox}>
                            <div style={s.scanningSpinner} />
                            <div style={s.scanningTitle}>AI is analyzing...</div>
                            <div style={s.scanningDesc}>Running {activeTab} scan on {filePath?.split('/').pop()}</div>
                        </div>
                    )}

                    {scanError && (
                        <div style={s.errorBox}>
                            <div style={s.errorIcon}>❌</div>
                            <div style={s.errorMsg}>{scanError}</div>
                        </div>
                    )}

                    {currentReport && !scanning && (
                        <div>
                            {/* Report Header */}
                            <div style={s.reportHeader}>
                                <div style={s.reportHeaderLeft}>
                                    <div style={s.reportTitle}>
                                        {activeTab === 'review' && '🤖 Code Review'}
                                        {activeTab === 'security' && '🛡️ Security Scan'}
                                        {activeTab === 'performance' && '⚡ Performance'}
                                    </div>
                                    <div style={s.reportSummary}>{currentReport.summary}</div>
                                </div>
                                {score != null ? (
                                    <div style={{ ...s.scoreCircle, borderColor: scoreColor(score) }}>
                                        <span style={{ ...s.scoreNum, color: scoreColor(score) }}>{score}</span>
                                        <span style={s.scoreLabel}>/100</span>
                                    </div>
                                ) : currentReport.risk_level ? (
                                    <div style={{ ...s.scoreCircle, borderColor: SEV[currentReport.risk_level] || 'var(--border-default)' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: SEV[currentReport.risk_level], textAlign: 'center', textTransform: 'uppercase' }}>
                                            {currentReport.risk_level}
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Severity Filter */}
                            {getFindings().length > 0 && (
                                <div style={s.filterRow}>
                                    {['all', 'critical', 'high', 'medium', 'low', 'info'].map(sv => (
                                        <button key={sv} style={{
                                            ...s.filterBtn,
                                            background: severityFilter === sv ? (SEV[sv] ? SEV[sv] + '22' : 'var(--primary-subtle)') : 'transparent',
                                            color: severityFilter === sv ? (SEV[sv] || 'var(--primary)') : 'var(--text-muted)',
                                            borderColor: severityFilter === sv ? (SEV[sv] || 'var(--primary)') : 'var(--border-subtle)',
                                        }} onClick={() => setSeverityFilter(sv)}>
                                            {sv.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Findings */}
                            {getFindings().length === 0 ? (
                                <div style={s.noIssues}>
                                    <div style={s.noIssuesIcon}>✅</div>
                                    <div style={s.noIssuesText}>No issues found!</div>
                                </div>
                            ) : (
                                <div>
                                    <div style={s.findingsCount}>{filteredFindings.length} of {getFindings().length} issues</div>
                                    {filteredFindings.map((f, i) => (
                                        <div key={i} style={s.findingCard} onClick={() => toggleFinding(i)}>
                                            <div style={s.findingTop}>
                                                <div style={{ ...s.sevBadge, background: (SEV[f.severity] || '#6b7280') + '20', color: SEV[f.severity] || '#6b7280', borderColor: (SEV[f.severity] || '#6b7280') + '50' }}>
                                                    {(f.severity || 'info').toUpperCase()}
                                                </div>
                                                <div style={{ ...s.catBadge, color: CAT[f.category] || 'var(--text-muted)' }}>
                                                    {f.owasp_category || f.category}
                                                </div>
                                                {f.line_start && <div style={s.lineRef}>L{f.line_start}{f.line_end !== f.line_start ? `-${f.line_end}` : ''}</div>}
                                                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '12px' }}>{expandedFindings[i] ? '▲' : '▼'}</span>
                                            </div>
                                            <div style={s.findingTitle}>{f.title}</div>

                                            {expandedFindings[i] && (
                                                <div style={s.findingBody}>
                                                    <div style={s.findingDesc}>{f.description}</div>
                                                    {f.impact && (
                                                        <div style={{ ...s.suggestion, borderColor: '#f59e0b' }}>
                                                            <div style={{ ...s.suggestionLabel, color: '#f59e0b' }}>📊 Impact</div>
                                                            <div style={s.suggestionText}>{f.impact}</div>
                                                        </div>
                                                    )}
                                                    <div style={s.suggestion}>
                                                        <div style={s.suggestionLabel}>💡 {activeTab === 'security' ? 'Remediation' : 'Suggestion'}</div>
                                                        <div style={s.suggestionText}>{f.remediation || f.suggestion}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const s = {
    page: { padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' },

    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
    crumbLink: { color: 'var(--primary)', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: 'var(--text-muted)', fontSize: '13px' },
    crumbActive: { color: 'var(--text-primary)', fontSize: '13px', fontWeight: '500' },
    fileMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
    metaBadge: { background: 'var(--primary-subtle)', color: 'var(--text-accent)', fontSize: '11px', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' },
    metaText: { color: 'var(--text-muted)', fontSize: '12px' },
    metaDot: { color: 'var(--text-muted)', fontSize: '12px' },

    scanButtons: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    scanBtn: { borderRadius: 'var(--radius-md)', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)' },

    layout: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px', alignItems: 'start' },

    codePanel: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
    codePanelHeader: { padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: '8px' },
    fileName: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' },
    codeContainer: { overflow: 'auto', maxHeight: '75vh' },
    table: { width: '100%', borderCollapse: 'collapse' },
    row: { borderBottom: '1px solid rgba(255,255,255,0.02)' },
    lineNum: { color: 'var(--text-muted)', fontSize: '12px', padding: '1px 12px 1px 16px', textAlign: 'right', userSelect: 'none', width: '44px', verticalAlign: 'top', fontFamily: '"JetBrains Mono", monospace' },
    lineCode: { padding: '1px 16px 1px 8px' },
    pre: { margin: 0, color: 'var(--text-primary)', fontSize: '13px', fontFamily: '"JetBrains Mono", "Fira Code", monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: '1.6' },

    reportPanel: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', position: 'sticky', top: '20px', maxHeight: '85vh', overflowY: 'auto' },

    emptyReport: { textAlign: 'center', padding: '40px 16px' },
    emptyReportIcon: { fontSize: '40px', marginBottom: '12px' },
    emptyReportTitle: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' },
    emptyReportDesc: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' },
    scanHints: { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
    scanHint: { fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' },

    scanningBox: { textAlign: 'center', padding: '40px 16px' },
    scanningSpinner: { width: '36px', height: '36px', border: '3px solid var(--border-default)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' },
    scanningTitle: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' },
    scanningDesc: { fontSize: '12px', color: 'var(--text-muted)' },

    errorBox: { textAlign: 'center', padding: '32px 16px' },
    errorIcon: { fontSize: '32px', marginBottom: '12px' },
    errorMsg: { fontSize: '13px', color: 'var(--danger)' },

    reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' },
    reportHeaderLeft: { flex: 1 },
    reportTitle: { fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
    reportSummary: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' },
    scoreCircle: { width: '60px', height: '60px', borderRadius: '50%', border: '2px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    scoreNum: { fontSize: '20px', fontWeight: '800', lineHeight: 1 },
    scoreLabel: { fontSize: '10px', color: 'var(--text-muted)' },

    filterRow: { display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px' },
    filterBtn: { border: '1px solid', borderRadius: 'var(--radius-sm)', padding: '3px 8px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', transition: 'var(--transition)' },

    noIssues: { textAlign: 'center', padding: '24px' },
    noIssuesIcon: { fontSize: '28px', marginBottom: '8px' },
    noIssuesText: { fontSize: '14px', fontWeight: '600', color: '#22c55e' },

    findingsCount: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' },
    findingCard: { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '8px', cursor: 'pointer', transition: 'var(--transition)' },
    findingTop: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' },
    sevBadge: { fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', border: '1px solid' },
    catBadge: { fontSize: '11px', fontWeight: '500' },
    lineRef: { fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-overlay)', padding: '1px 6px', borderRadius: '3px' },
    findingTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' },
    findingBody: { marginTop: '10px' },
    findingDesc: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '10px' },
    suggestion: { borderLeft: '3px solid #22c55e', background: 'rgba(34,197,94,0.05)', padding: '8px 12px', borderRadius: '4px', marginBottom: '8px' },
    suggestionLabel: { fontSize: '11px', fontWeight: '700', color: '#22c55e', marginBottom: '4px' },
    suggestionText: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' },

    imageContainer: { padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', background: 'repeating-conic-gradient(var(--bg-elevated) 0% 25%, var(--bg-surface) 0% 50%) 0 0 / 20px 20px' },
    imagePreview: { maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },

    center: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' },
    spinner: { width: '32px', height: '32px', border: '3px solid var(--border-default)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: 'var(--text-secondary)', fontSize: '14px' },
    errorText: { color: 'var(--danger)', fontSize: '15px' },
}
