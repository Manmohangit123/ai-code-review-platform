import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPullRequests, analyzeCode } from '../services/api'

export default function PRAnalysis() {
    const { owner, repo } = useParams()
    const navigate = useNavigate()
    const [prs, setPrs] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPR, setSelectedPR] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [report, setReport] = useState(null)
    const [error, setError] = useState(null)

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
        } catch (err) {
            setError('PR analysis failed. Make sure AI service is running.')
        } finally {
            setAnalyzing(false)
        }
    }

    const avgScore = report
        ? Math.round(report.results.filter(r => r.result?.overall_score).reduce((sum, r) => sum + r.result.overall_score, 0) / (report.results.filter(r => r.result?.overall_score).length || 1))
        : null

    const scoreColor = avgScore >= 80 ? '#3fb950' : avgScore >= 60 ? '#d29922' : '#f85149'

    if (loading) return <div style={styles.center}><p style={styles.loading}>Loading pull requests...</p></div>

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.breadcrumb}>
                    <span style={styles.crumbLink} onClick={() => navigate('/repos')}>Repositories</span>
                    <span style={styles.crumbSep}>/</span>
                    <span style={styles.crumbLink} onClick={() => navigate(`/repos/${owner}/${repo}`)}>{repo}</span>
                    <span style={styles.crumbSep}>/</span>
                    <span style={styles.crumbActive}>PR Analysis</span>
                </div>
                <h2 style={styles.title}>🔀 Pull Request Analysis</h2>
                <p style={styles.subtitle}>Select a PR to get an AI code review of all changed files</p>
            </div>

            {error && <div style={styles.errorBox}><p style={styles.errorText}>{error}</p></div>}

            <div style={styles.layout}>
                {/* PR List */}
                <div style={styles.prList}>
                    <h3 style={styles.sectionTitle}>Open Pull Requests ({prs.length})</h3>
                    {prs.length === 0 && (
                        <div style={styles.emptyBox}>
                            <p style={styles.emptyText}>No open pull requests found.</p>
                        </div>
                    )}
                    {prs.map(pr => (
                        <div
                            key={pr.number}
                            style={{ ...styles.prCard, border: selectedPR?.number === pr.number ? '1px solid #58a6ff' : '1px solid #30363d' }}
                            onClick={() => handleAnalyzePR(pr)}
                        >
                            <div style={styles.prTop}>
                                <span style={styles.prNumber}>#{pr.number}</span>
                                <span style={styles.prState}>open</span>
                            </div>
                            <p style={styles.prTitle}>{pr.title}</p>
                            <div style={styles.prMeta}>
                                <span style={styles.prAuthor}>👤 {pr.user}</span>
                                <span style={styles.prFiles}>📁 {pr.changed_files} files</span>
                            </div>
                            <button
                                style={{ ...styles.analyzeBtn, opacity: analyzing && selectedPR?.number === pr.number ? 0.6 : 1 }}
                                disabled={analyzing}
                            >
                                {analyzing && selectedPR?.number === pr.number ? '⏳ Analyzing...' : '🔍 Analyze PR'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Report Panel */}
                <div style={styles.reportPanel}>
                    {analyzing && (
                        <div style={styles.analyzingBox}>
                            <p style={styles.analyzingText}>⏳ AI is reviewing changed files in PR #{selectedPR?.number}...</p>
                            <p style={styles.analyzingSubtext}>This may take 1-3 minutes depending on the number of files.</p>
                        </div>
                    )}

                    {report && !analyzing && (
                        <div>
                            <div style={styles.reportHeader}>
                                <div>
                                    <h3 style={styles.reportTitle}>PR #{report.pr.number}: {report.pr.title}</h3>
                                    <p style={styles.reportMeta}>Analyzed {report.results.length} file(s)</p>
                                </div>
                                {avgScore !== null && (
                                    <div style={{ ...styles.scoreCircle, borderColor: scoreColor }}>
                                        <span style={{ ...styles.scoreNumber, color: scoreColor }}>{avgScore}</span>
                                        <span style={styles.scoreLabel}>avg</span>
                                    </div>
                                )}
                            </div>

                            {report.results.map((item, i) => (
                                <div key={i} style={styles.fileCard}>
                                    <div style={styles.fileHeader}>
                                        <span style={styles.fileName}>📄 {item.file}</span>
                                        <div style={styles.fileDiff}>
                                            <span style={styles.additions}>+{item.additions}</span>
                                            <span style={styles.deletions}>-{item.deletions}</span>
                                            <span style={{ ...styles.fileStatus, background: item.status === 'added' ? '#238636' : item.status === 'removed' ? '#b91c1c' : '#1f6feb' }}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>

                                    {item.result ? (
                                        <div>
                                            <div style={styles.fileScore}>
                                                Score: <strong style={{ color: item.result.overall_score >= 80 ? '#3fb950' : item.result.overall_score >= 60 ? '#d29922' : '#f85149' }}>
                                                    {item.result.overall_score}/100
                                                </strong>
                                                <span style={styles.fileSummary}> — {item.result.summary}</span>
                                            </div>
                                            {item.result.findings?.length > 0 && (
                                                <div style={styles.findingsList}>
                                                    {item.result.findings.map((f, j) => (
                                                        <div key={j} style={styles.finding}>
                                                            <span style={{ ...styles.badge, background: f.severity === 'critical' ? '#b91c1c' : f.severity === 'high' ? '#f85149' : f.severity === 'medium' ? '#d29922' : '#1f6feb' }}>
                                                                {f.severity}
                                                            </span>
                                                            <span style={styles.findingTitle}>{f.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={styles.noResult}>Could not analyze this file.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!report && !analyzing && (
                        <div style={styles.emptyReport}>
                            <p style={styles.emptyReportIcon}>🔀</p>
                            <p style={styles.emptyReportText}>Select a Pull Request from the left to start the AI analysis.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
    crumbLink: { color: '#58a6ff', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: '#6e7681', fontSize: '13px' },
    crumbActive: { color: '#e6edf3', fontSize: '13px' },
    title: { color: '#e6edf3', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' },
    subtitle: { color: '#8b949e', fontSize: '13px', margin: 0 },
    errorBox: { background: '#161b22', border: '1px solid #f85149', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
    errorText: { color: '#f85149', margin: 0 },
    layout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' },
    prList: { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '16px' },
    sectionTitle: { color: '#e6edf3', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' },
    emptyBox: { textAlign: 'center', padding: '32px 0' },
    emptyText: { color: '#8b949e', fontSize: '14px' },
    prCard: { background: '#0d1117', borderRadius: '8px', padding: '14px', marginBottom: '12px', cursor: 'pointer', transition: 'border 0.15s' },
    prTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
    prNumber: { color: '#8b949e', fontSize: '12px', fontWeight: '600' },
    prState: { background: '#238636', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' },
    prTitle: { color: '#e6edf3', fontSize: '13px', fontWeight: '600', margin: '0 0 8px', lineHeight: '1.4' },
    prMeta: { display: 'flex', gap: '12px', marginBottom: '10px' },
    prAuthor: { color: '#8b949e', fontSize: '11px' },
    prFiles: { color: '#8b949e', fontSize: '11px' },
    analyzeBtn: { width: '100%', background: '#1f6feb', color: 'white', border: 'none', borderRadius: '6px', padding: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    reportPanel: { background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '20px', minHeight: '400px' },
    analyzingBox: { textAlign: 'center', padding: '60px 20px' },
    analyzingText: { color: '#58a6ff', fontSize: '16px', marginBottom: '8px' },
    analyzingSubtext: { color: '#8b949e', fontSize: '13px' },
    reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #30363d' },
    reportTitle: { color: '#e6edf3', fontSize: '16px', fontWeight: '700', margin: '0 0 4px' },
    reportMeta: { color: '#8b949e', fontSize: '12px', margin: 0 },
    scoreCircle: { width: '64px', height: '64px', borderRadius: '50%', border: '3px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    scoreNumber: { fontSize: '20px', fontWeight: '700', lineHeight: 1 },
    scoreLabel: { color: '#8b949e', fontSize: '10px' },
    fileCard: { background: '#0d1117', border: '1px solid #21262d', borderRadius: '8px', padding: '14px', marginBottom: '12px' },
    fileHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    fileName: { color: '#58a6ff', fontSize: '13px', fontWeight: '600' },
    fileDiff: { display: 'flex', alignItems: 'center', gap: '8px' },
    additions: { color: '#3fb950', fontSize: '12px', fontWeight: '600' },
    deletions: { color: '#f85149', fontSize: '12px', fontWeight: '600' },
    fileStatus: { color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' },
    fileScore: { color: '#8b949e', fontSize: '13px', marginBottom: '8px' },
    fileSummary: { color: '#8b949e' },
    findingsList: { display: 'flex', flexDirection: 'column', gap: '6px' },
    finding: { display: 'flex', alignItems: 'center', gap: '8px' },
    badge: { color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', flexShrink: 0 },
    findingTitle: { color: '#e6edf3', fontSize: '12px' },
    noResult: { color: '#8b949e', fontSize: '12px', margin: 0 },
    emptyReport: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' },
    emptyReportIcon: { fontSize: '48px', margin: '0 0 16px' },
    emptyReportText: { color: '#8b949e', fontSize: '14px', textAlign: 'center' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' },
    loading: { color: '#58a6ff', fontSize: '16px' }
}
