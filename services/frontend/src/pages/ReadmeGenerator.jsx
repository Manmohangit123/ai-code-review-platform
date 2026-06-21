import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFileTree, getFileContent, generateReadme } from '../services/api'

export default function ReadmeGenerator() {
    const { owner, repo } = useParams()
    const navigate = useNavigate()
    const [tree, setTree] = useState([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [readme, setReadme] = useState(null)
    const [error, setError] = useState(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        getFileTree(owner, repo)
            .then(res => setTree(res.data.tree))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [owner, repo])

    const handleGenerate = async () => {
        setGenerating(true)
        setError(null)
        setReadme(null)
        try {
            const filePaths = tree.map(f => f.path)

            // Pick 3 meaningful code files as samples
            const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'go']
            const sampleFiles = tree
                .filter(f => codeExts.includes(f.path.split('.').pop()))
                .slice(0, 3)

            const codeSamples = await Promise.all(
                sampleFiles.map(async f => {
                    try {
                        const res = await getFileContent(owner, repo, f.path)
                        return { path: f.path, content: res.data.content }
                    } catch {
                        return { path: f.path, content: '' }
                    }
                })
            )

            const res = await generateReadme(repo, filePaths, codeSamples)
            setReadme(res.data.readme)
        } catch (err) {
            setError('README generation failed. Make sure AI service is running.')
        } finally {
            setGenerating(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(readme)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const blob = new Blob([readme], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'README.md'
        a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return <div style={styles.center}><p style={styles.loading}>Loading repository...</p></div>

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <div style={styles.breadcrumb}>
                        <span style={styles.crumbLink} onClick={() => navigate('/repos')}>Repositories</span>
                        <span style={styles.crumbSep}>/</span>
                        <span style={styles.crumbLink} onClick={() => navigate(`/repos/${owner}/${repo}`)}>{repo}</span>
                        <span style={styles.crumbSep}>/</span>
                        <span style={styles.crumbActive}>README Generator</span>
                    </div>
                    <h2 style={styles.title}>📝 README Generator</h2>
                    <p style={styles.subtitle}>AI will analyze your repository and generate a professional README.md</p>
                </div>
                <button
                    style={{ ...styles.generateBtn, opacity: generating ? 0.7 : 1 }}
                    onClick={handleGenerate}
                    disabled={generating}
                >
                    {generating ? '⏳ Generating...' : '✨ Generate README'}
                </button>
            </div>

            {generating && (
                <div style={styles.generatingBox}>
                    <p style={styles.generatingText}>⏳ AI is reading your repository and writing the README... this takes 60-90 seconds.</p>
                </div>
            )}

            {error && (
                <div style={styles.errorBox}>
                    <p style={styles.errorText}>{error}</p>
                </div>
            )}

            {readme && (
                <div style={styles.resultBox}>
                    <div style={styles.resultHeader}>
                        <h3 style={styles.resultTitle}>✅ README.md Generated</h3>
                        <div style={styles.actions}>
                            <button style={styles.copyBtn} onClick={handleCopy}>
                                {copied ? '✅ Copied!' : '📋 Copy'}
                            </button>
                            <button style={styles.downloadBtn} onClick={handleDownload}>
                                ⬇️ Download README.md
                            </button>
                        </div>
                    </div>
                    <pre style={styles.readmeContent}>{readme}</pre>
                </div>
            )}

            {!readme && !generating && (
                <div style={styles.infoBox}>
                    <p style={styles.infoTitle}>📁 Repository: {owner}/{repo}</p>
                    <p style={styles.infoText}>{tree.length} files detected</p>
                    <p style={styles.infoText}>Click "Generate README" to create a professional README.md using AI.</p>
                </div>
            )}
        </div>
    )
}

const styles = {
    container: { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
    crumbLink: { color: '#58a6ff', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: '#6e7681', fontSize: '13px' },
    crumbActive: { color: '#e6edf3', fontSize: '13px' },
    title: { color: '#e6edf3', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' },
    subtitle: { color: '#8b949e', fontSize: '13px', margin: 0 },
    generateBtn: { background: '#1f6feb', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
    generatingBox: { background: '#161b22', border: '1px solid #1f6feb', borderRadius: '8px', padding: '20px', marginBottom: '24px', textAlign: 'center' },
    generatingText: { color: '#58a6ff', margin: 0 },
    errorBox: { background: '#161b22', border: '1px solid #f85149', borderRadius: '8px', padding: '16px', marginBottom: '24px' },
    errorText: { color: '#f85149', margin: 0 },
    resultBox: { background: '#161b22', border: '1px solid #3fb950', borderRadius: '10px', overflow: 'hidden' },
    resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #30363d', flexWrap: 'wrap', gap: '12px' },
    resultTitle: { color: '#3fb950', fontSize: '16px', fontWeight: '700', margin: 0 },
    actions: { display: 'flex', gap: '8px' },
    copyBtn: { background: '#21262d', color: '#e6edf3', border: '1px solid #30363d', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', cursor: 'pointer' },
    downloadBtn: { background: '#238636', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    readmeContent: { padding: '24px', color: '#e6edf3', fontSize: '13px', fontFamily: '"Fira Code", monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, maxHeight: '600px', overflowY: 'auto' },
    infoBox: { background: '#161b22', border: '1px dashed #30363d', borderRadius: '10px', padding: '40px', textAlign: 'center' },
    infoTitle: { color: '#e6edf3', fontSize: '18px', fontWeight: '600', margin: '0 0 8px' },
    infoText: { color: '#8b949e', fontSize: '14px', margin: '4px 0' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' },
    loading: { color: '#58a6ff', fontSize: '16px' }
}
