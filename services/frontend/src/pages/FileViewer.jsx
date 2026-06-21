import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getFileContent, analyzeCode, scanSecurity, scanPerformance } from '../services/api'
import { saveReview } from '../services/analytics'

const getLanguage = (path) => {
    const ext = path?.split('.').pop()
    const map = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', css: 'css', html: 'html', json: 'json', sql: 'sql', md: 'markdown' }
    return map[ext] || 'unknown'
}

const SEVERITY_COLORS = { critical: '#f85149', high: '#ff7b72', medium: '#e3b341', low: '#58a6ff', info: '#8b949e', none: '#3fb950' }
const CATEGORY_COLORS = { bug: '#f85149', security: '#ff7b72', performance: '#e3b341', style: '#58a6ff', complexity: '#a371f7', memory: '#e3b341', database: '#f85149', network: '#58a6ff', rendering: '#a371f7', bundle: '#8b949e' }

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

    const filteredFindings = getFindings().filter(f =>
        severityFilter === 'all' || f.severity === severityFilter
    )

    if (loading) return <div style={styles.center}><p style={styles.loading}>Loading file...</p></div>
    if (error) return <div style={styles.center}><p style={styles.errorText}>Error: {error}</p></div>

    const lines = file?.content?.split('\n') || []
    const currentReport = reports[activeTab]

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.breadcrumb}>
                    <span style={styles.crumbLink} onClick={() => navigate('/repos')}>Repositories</span>
                    <span style={styles.crumbSep}>/</span>
                    <span style={styles.crumbLink} onClick={() => navigate(`/repos/${owner}/${repo}`)}>{repo}</span>
                    <span style={styles.crumbSep}>/</span>
                    <span style={styles.crumbActive}>{filePath}</span>
                </div>

                {/* Scan buttons */}
                <div style={styles.scanButtons}>
                    <button style={{ ...styles.scanBtn, background: '#238636' }} onClick={() => runScan('review')} disabled={scanning}>
                        🤖 Code Review
                    </button>
                    <button style={{ ...styles.scanBtn, background: '#da3633' }} onClick={() => runScan('security')} disabled={scanning}>
                        🔒 Security Scan
                    </button>
                    <button style={{ ...styles.scanBtn, background: '#9a6700' }} onClick={() => runScan('performance')} disabled={scanning}>
                        ⚡ Performance
                    </button>
                </div>
            </div>

            {/* Scanning indicator */}
            {scanning && (
                <div style={styles.scanningBox}>
                    <p style={styles.scanningText}>⏳ AI is analyzing your code...</p>
                </div>
            )}

            {scanError && (
                <div style={styles.errorBox}>
                    <p style={styles.errorText}>{scanError}</p>
                </div>
            )}

            {/* Report */}
            {currentReport && !scanning && (
                <div style={styles.reportBox}>
                    {/* Report header */}
                    <div style={styles.reportHeader}>
                        <div>
                            <h3 style={styles.reportTitle}>
                                {activeTab === 'review' && '🤖 Code Review Report'}
                                {activeTab === 'security' && '🔒 Security Scan Report'}
                                {activeTab === 'performance' && '⚡ Performance Report'}
                            </h3>
                            <p style={styles.reportSummary}>{currentReport.summary}</p>
                        </div>

                        {/* Score */}
                        {activeTab === 'review' && (
                            <div style={styles.scoreCircle}>
                                <span style={{ ...styles.scoreNumber, color: currentReport.overall_score >= 70 ? '#3fb950' : currentReport.overall_score >= 40 ? '#e3b341' : '#f85149' }}>
                                    {currentReport.overall_score}
                                </span>
                                <span style={styles.scoreLabel}>/ 100</span>
                            </div>
                        )}
                        {activeTab === 'security' && (
                            <div style={{ ...styles.scoreCircle, borderColor: SEVERITY_COLORS[currentReport.risk_level] || '#30363d' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: SEVERITY_COLORS[currentReport.risk_level] || '#8b949e', textAlign: 'center' }}>
                                    {(currentReport.risk_level || 'none').toUpperCase()}
                                </span>
                                <span style={styles.scoreLabel}>risk</span>
                            </div>
                        )}
                        {activeTab === 'performance' && (
                            <div style={styles.scoreCircle}>
                                <span style={{ ...styles.scoreNumber, color: currentReport.performance_score >= 70 ? '#3fb950' : currentReport.performance_score >= 40 ? '#e3b341' : '#f85149' }}>
                                    {currentReport.performance_score}
                                </span>
                                <span style={styles.scoreLabel}>/ 100</span>
                            </div>
                        )}
                    </div>

                    {/* Severity filter */}
                    {getFindings().length > 0 && (
                        <div style={styles.filterRow}>
                            <span style={styles.filterLabel}>Filter by severity:</span>
                            {['all', 'critical', 'high', 'medium', 'low', 'info'].map(s => (
                                <button
                                    key={s}
                                    style={{
                                        ...styles.filterBtn,
                                        background: severityFilter === s ? (SEVERITY_COLORS[s] || '#58a6ff') + '33' : 'transparent',
                                        color: severityFilter === s ? (SEVERITY_COLORS[s] || '#58a6ff') : '#8b949e',
                                        borderColor: severityFilter === s ? (SEVERITY_COLORS[s] || '#58a6ff') : '#30363d'
                                    }}
                                    onClick={() => setSeverityFilter(s)}
                                >
                                    {s.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Findings */}
                    {getFindings().length === 0 ? (
                        <p style={styles.noFindings}>✅ No issues found!</p>
                    ) : (
                        <div>
                            <p style={styles.findingsCount}>{filteredFindings.length} of {getFindings().length} issue(s) shown</p>
                            {filteredFindings.map((f, i) => (
                                <div key={i} style={styles.findingCard}>
                                    <div style={styles.findingTop}>
                                        <span style={{ ...styles.badge, background: (SEVERITY_COLORS[f.severity] || '#8b949e') + '22', color: SEVERITY_COLORS[f.severity] || '#8b949e', border: `1px solid ${SEVERITY_COLORS[f.severity] || '#8b949e'}` }}>
                                            {(f.severity || '').toUpperCase()}
                                        </span>
                                        <span style={{ ...styles.badge, background: '#21262d', color: CATEGORY_COLORS[f.category] || '#8b949e' }}>
                                            {f.owasp_category || f.category}
                                        </span>
                                        {f.line_start && (
                                            <span style={styles.lineRef}>Line {f.line_start}{f.line_end && f.line_end !== f.line_start ? `-${f.line_end}` : ''}</span>
                                        )}
                                    </div>
                                    <p style={styles.findingTitle}>{f.title}</p>
                                    <p style={styles.findingDesc}>{f.description}</p>
                                    {f.impact && (
                                        <div style={{ ...styles.suggestionBox, borderLeftColor: '#e3b341' }}>
                                            <p style={{ ...styles.suggestionLabel, color: '#e3b341' }}>📊 Impact</p>
                                            <p style={styles.suggestionText}>{f.impact}</p>
                                        </div>
                                    )}
                                    <div style={styles.suggestionBox}>
                                        <p style={styles.suggestionLabel}>💡 {activeTab === 'security' ? 'Remediation' : 'Suggestion'}</p>
                                        <p style={styles.suggestionText}>{f.remediation || f.suggestion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* File content */}
            <div style={styles.fileMeta}>
                <span style={styles.metaText}>{lines.length} lines · {(file.size / 1024).toFixed(1)} KB · {getLanguage(filePath)}</span>
            </div>
            <div style={styles.codeContainer}>
                <table style={styles.table}>
                    <tbody>
                        {lines.map((line, i) => (
                            <tr key={i} style={styles.row}>
                                <td style={styles.lineNum}>{i + 1}</td>
                                <td style={styles.lineCode}><pre style={styles.pre}>{line}</pre></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const styles = {
    container: { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px' },
    crumbLink: { color: '#58a6ff', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: '#6e7681', fontSize: '13px' },
    crumbActive: { color: '#e6edf3', fontSize: '13px' },
    scanButtons: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    scanBtn: { color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    scanningBox: { background: '#161b22', border: '1px solid #1f6feb', borderRadius: '8px', padding: '16px', marginBottom: '20px', textAlign: 'center' },
    scanningText: { color: '#58a6ff', margin: 0 },
    errorBox: { background: '#161b22', border: '1px solid #f85149', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
    errorText: { color: '#f85149', margin: 0 },
    reportBox: { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '24px', marginBottom: '24px' },
    reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
    reportTitle: { color: '#e6edf3', fontSize: '18px', fontWeight: '700', margin: '0 0 6px' },
    reportSummary: { color: '#8b949e', fontSize: '13px', margin: 0, maxWidth: '700px' },
    scoreCircle: { background: '#0d1117', border: '2px solid #30363d', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    scoreNumber: { fontSize: '24px', fontWeight: '700' },
    scoreLabel: { color: '#6e7681', fontSize: '11px' },
    filterRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
    filterLabel: { color: '#8b949e', fontSize: '12px' },
    filterBtn: { border: '1px solid', borderRadius: '4px', padding: '3px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
    noFindings: { color: '#3fb950', fontSize: '14px', margin: 0 },
    findingsCount: { color: '#8b949e', fontSize: '13px', marginBottom: '12px' },
    findingCard: { background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
    findingTop: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' },
    badge: { fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
    lineRef: { color: '#6e7681', fontSize: '11px', marginLeft: 'auto' },
    findingTitle: { color: '#e6edf3', fontSize: '14px', fontWeight: '600', margin: '0 0 4px' },
    findingDesc: { color: '#8b949e', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.5' },
    suggestionBox: { background: '#161b22', borderLeft: '3px solid #3fb950', padding: '10px 14px', borderRadius: '4px', marginBottom: '8px' },
    suggestionLabel: { color: '#3fb950', fontSize: '11px', fontWeight: '700', margin: '0 0 4px' },
    suggestionText: { color: '#8b949e', fontSize: '13px', margin: 0, lineHeight: '1.5' },
    fileMeta: { marginBottom: '8px' },
    metaText: { color: '#6e7681', fontSize: '12px' },
    codeContainer: { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    row: { borderBottom: '1px solid #21262d10' },
    lineNum: { color: '#6e7681', fontSize: '12px', padding: '2px 16px', textAlign: 'right', userSelect: 'none', width: '48px', verticalAlign: 'top' },
    lineCode: { padding: '2px 16px 2px 8px' },
    pre: { margin: 0, color: '#e6edf3', fontSize: '13px', fontFamily: '"Fira Code", "Cascadia Code", monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' },
    loading: { color: '#58a6ff', fontSize: '16px' }
}
