import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getFileContent, analyzeCode } from '../services/api'

const getLanguage = (path) => {
    const ext = path.split('.').pop()
    const map = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', css: 'css', html: 'html', json: 'json', sql: 'sql', md: 'markdown' }
    return map[ext] || 'unknown'
}

export default function FileViewer() {
    const { owner, repo } = useParams()
    const [searchParams] = useSearchParams()
    const filePath = searchParams.get('path')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [report, setReport] = useState(null)
    const [analyzeError, setAnalyzeError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!filePath) return
        getFileContent(owner, repo, filePath)
            .then(res => setFile(res.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [owner, repo, filePath])

    const handleAnalyze = async () => {
        setAnalyzing(true)
        setReport(null)
        setAnalyzeError(null)
        try {
            const res = await analyzeCode(filePath, file.content, getLanguage(filePath))
            setReport(res.data)
        } catch (err) {
            setAnalyzeError('AI analysis failed. Make sure Ollama is running.')
        } finally {
            setAnalyzing(false)
        }
    }

    if (loading) return <div style={styles.center}><p style={styles.loading}>Loading file...</p></div>
    if (error) return <div style={styles.center}><p style={styles.error}>Error: {error}</p></div>

    const lines = file?.content?.split('\n') || []

    const severityColor = { critical: '#f85149', high: '#ff7b72', medium: '#e3b341', low: '#58a6ff', info: '#8b949e' }
    const categoryBadge = { bug: '#f85149', security: '#ff7b72', performance: '#e3b341', style: '#58a6ff', complexity: '#a371f7' }

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
                <button
                    style={{ ...styles.analyzeBtn, opacity: analyzing ? 0.7 : 1 }}
                    onClick={handleAnalyze}
                    disabled={analyzing}
                >
                    {analyzing ? '⏳ Analyzing...' : '🤖 Analyze with AI'}
                </button>
            </div>

            {/* AI Report */}
            {analyzing && (
                <div style={styles.analyzingBox}>
                    <p style={styles.analyzingText}>AI is reviewing your code... this takes 30-60 seconds.</p>
                </div>
            )}

            {analyzeError && (
                <div style={styles.errorBox}>
                    <p style={styles.errorText}>{analyzeError}</p>
                </div>
            )}

            {report && (
                <div style={styles.reportBox}>
                    <div style={styles.reportHeader}>
                        <div>
                            <h3 style={styles.reportTitle}>AI Code Review Report</h3>
                            <p style={styles.reportSummary}>{report.summary}</p>
                        </div>
                        <div style={styles.scoreCircle}>
                            <span style={{ ...styles.scoreNumber, color: report.overall_score >= 70 ? '#3fb950' : report.overall_score >= 40 ? '#e3b341' : '#f85149' }}>
                                {report.overall_score}
                            </span>
                            <span style={styles.scoreLabel}>/ 100</span>
                        </div>
                    </div>

                    {report.findings.length === 0 ? (
                        <p style={styles.noFindings}>✅ No issues found. Great code!</p>
                    ) : (
                        <div style={styles.findings}>
                            <p style={styles.findingsTitle}>{report.findings.length} issue(s) found</p>
                            {report.findings.map((f, i) => (
                                <div key={i} style={styles.findingCard}>
                                    <div style={styles.findingTop}>
                                        <span style={{ ...styles.severityBadge, background: severityColor[f.severity] + '22', color: severityColor[f.severity], border: `1px solid ${severityColor[f.severity]}` }}>
                                            {f.severity.toUpperCase()}
                                        </span>
                                        <span style={{ ...styles.categoryBadge, background: (categoryBadge[f.category] || '#8b949e') + '22', color: categoryBadge[f.category] || '#8b949e' }}>
                                            {f.category}
                                        </span>
                                        {f.line_start && (
                                            <span style={styles.lineRef}>Line {f.line_start}{f.line_end && f.line_end !== f.line_start ? `-${f.line_end}` : ''}</span>
                                        )}
                                    </div>
                                    <p style={styles.findingTitle}>{f.title}</p>
                                    <p style={styles.findingDesc}>{f.description}</p>
                                    <div style={styles.suggestionBox}>
                                        <p style={styles.suggestionLabel}>💡 Suggestion</p>
                                        <p style={styles.suggestionText}>{f.suggestion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* File content */}
            <div style={styles.fileMeta}>
                <span style={styles.metaText}>{lines.length} lines · {(file.size / 1024).toFixed(1)} KB</span>
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px' },
    crumbLink: { color: '#58a6ff', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: '#6e7681', fontSize: '13px' },
    crumbActive: { color: '#e6edf3', fontSize: '13px' },
    analyzeBtn: { background: '#1f6feb', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    analyzingBox: { background: '#161b22', border: '1px solid #1f6feb', borderRadius: '8px', padding: '16px', marginBottom: '20px', textAlign: 'center' },
    analyzingText: { color: '#58a6ff', margin: 0 },
    errorBox: { background: '#161b22', border: '1px solid #f85149', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
    errorText: { color: '#f85149', margin: 0 },
    reportBox: { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '24px', marginBottom: '24px' },
    reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
    reportTitle: { color: '#e6edf3', fontSize: '18px', fontWeight: '700', margin: '0 0 6px' },
    reportSummary: { color: '#8b949e', fontSize: '13px', margin: 0, maxWidth: '700px' },
    scoreCircle: { background: '#0d1117', border: '2px solid #30363d', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    scoreNumber: { fontSize: '24px', fontWeight: '700' },
    scoreLabel: { color: '#6e7681', fontSize: '11px' },
    noFindings: { color: '#3fb950', fontSize: '14px', margin: 0 },
    findings: {},
    findingsTitle: { color: '#8b949e', fontSize: '13px', marginBottom: '12px' },
    findingCard: { background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
    findingTop: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' },
    severityBadge: { fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
    categoryBadge: { fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#21262d' },
    lineRef: { color: '#6e7681', fontSize: '11px', marginLeft: 'auto' },
    findingTitle: { color: '#e6edf3', fontSize: '14px', fontWeight: '600', margin: '0 0 4px' },
    findingDesc: { color: '#8b949e', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.5' },
    suggestionBox: { background: '#161b22', borderLeft: '3px solid #3fb950', padding: '10px 14px', borderRadius: '4px' },
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
    loading: { color: '#58a6ff', fontSize: '16px' },
    error: { color: '#f85149', fontSize: '16px' }
}
