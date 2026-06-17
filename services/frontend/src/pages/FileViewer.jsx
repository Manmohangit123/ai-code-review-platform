import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getFileContent } from '../services/api'

export default function FileViewer() {
    const { owner, repo } = useParams()
    const [searchParams] = useSearchParams()
    const filePath = searchParams.get('path')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!filePath) return
        getFileContent(owner, repo, filePath)
            .then(res => setFile(res.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [owner, repo, filePath])

    if (loading) return <div style={styles.center}><p style={styles.loading}>Loading file...</p></div>
    if (error) return <div style={styles.center}><p style={styles.error}>Error: {error}</p></div>

    const lines = file?.content?.split('\n') || []

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.breadcrumb}>
                    <span style={styles.crumbLink} onClick={() => navigate('/repos')}>Repositories</span>
                    <span style={styles.crumbSep}>/</span>
                    <span style={styles.crumbLink} onClick={() => navigate(`/repos/${owner}/${repo}`)}>{repo}</span>
                    <span style={styles.crumbSep}>/</span>
                    <span style={styles.crumbActive}>{filePath}</span>
                </div>
                <div style={styles.fileMeta}>
                    <span style={styles.lineCount}>{lines.length} lines</span>
                    <span style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
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
    header: { marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px' },
    crumbLink: { color: '#58a6ff', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: '#6e7681', fontSize: '13px' },
    crumbActive: { color: '#e6edf3', fontSize: '13px' },
    fileMeta: { display: 'flex', gap: '16px' },
    lineCount: { color: '#8b949e', fontSize: '12px' },
    fileSize: { color: '#8b949e', fontSize: '12px' },
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
