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
    const [activeTab, setActiveTab] = useState('preview')

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
            const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'go']
            const sampleFiles = tree.filter(f => codeExts.includes(f.path.split('.').pop())).slice(0, 3)
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
            setActiveTab('raw')
        } catch {
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

    if (loading) return (
        <div style={s.center}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Loading repository...</p>
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
                        <span style={s.crumbActive}>README Generator</span>
                    </div>
                    <h2 style={s.title}>📝 README Generator</h2>
                    <p style={s.subtitle}>AI analyzes your repository and generates a professional README.md</p>
                </div>
                <button
                    style={{ ...s.generateBtn, opacity: generating ? 0.6 : 1 }}
                    onClick={handleGenerate}
                    disabled={generating}
                >
                    {generating ? (
                        <><span style={s.btnSpinner} /> Generating...</>
                    ) : (
                        '✨ Generate README'
                    )}
                </button>
            </div>

            {/* Repo Info Bar */}
            {!readme && !generating && (
                <div style={s.infoBar}>
                    <div style={s.infoItem}>
                        <span style={s.infoIcon}>📁</span>
                        <span style={s.infoLabel}>Repository</span>
                        <span style={s.infoValue}>{owner}/{repo}</span>
                    </div>
                    <div style={s.infoDivider} />
                    <div style={s.infoItem}>
                        <span style={s.infoIcon}>📄</span>
                        <span style={s.infoLabel}>Files Detected</span>
                        <span style={s.infoValue}>{tree.length}</span>
                    </div>
                    <div style={s.infoDivider} />
                    <div style={s.infoItem}>
                        <span style={s.infoIcon}>🤖</span>
                        <span style={s.infoLabel}>AI Model</span>
                        <span style={s.infoValue}>qwen2.5:0.5b</span>
                    </div>
                </div>
            )}

            {/* Generating State */}
            {generating && (
                <div style={s.generatingBox}>
                    <div style={s.generatingInner}>
                        <div style={s.generatingSpinner} />
                        <div style={s.generatingTitle}>AI is writing your README...</div>
                        <div style={s.generatingDesc}>Analyzing {tree.length} files in {repo}</div>
                        <div style={s.generatingSteps}>
                            {['Reading file structure', 'Analyzing code samples', 'Writing documentation', 'Formatting markdown'].map((step, i) => (
                                <div key={i} style={s.step}>
                                    <div style={s.stepDot} />
                                    <span style={s.stepText}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={s.errorBox}>
                    <span style={s.errorIcon}>❌</span>
                    <span style={s.errorText}>{error}</span>
                </div>
            )}

            {/* Empty State */}
            {!readme && !generating && !error && (
                <div style={s.emptyBox}>
                    <div style={s.emptyIcon}>📝</div>
                    <div style={s.emptyTitle}>Generate a Professional README</div>
                    <div style={s.emptyDesc}>Click "Generate README" and AI will analyze your repository to create a complete, professional README.md with features, installation steps, usage examples, and more.</div>
                    <div style={s.emptyFeatures}>
                        {['Project Description', 'Features List', 'Tech Stack', 'Installation Steps', 'Usage Guide', 'API Docs', 'Contributing Guide', 'License'].map((f, i) => (
                            <span key={i} style={s.emptyTag}>✓ {f}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Result */}
            {readme && !generating && (
                <div style={s.resultBox}>
                    {/* Result Header */}
                    <div style={s.resultHeader}>
                        <div style={s.resultLeft}>
                            <div style={s.successBadge}>✅ README Generated</div>
                            <div style={s.resultMeta}>{readme.split('\n').length} lines · {(readme.length / 1024).toFixed(1)} KB</div>
                        </div>
                        <div style={s.resultActions}>
                            <button style={s.copyBtn} onClick={handleCopy}>
                                {copied ? '✅ Copied!' : '📋 Copy'}
                            </button>
                            <button style={s.downloadBtn} onClick={handleDownload}>
                                ⬇️ Download README.md
                            </button>
                            <button style={s.regenerateBtn} onClick={handleGenerate}>
                                🔄 Regenerate
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={s.tabs}>
                        <button
                            style={{ ...s.tab, ...(activeTab === 'raw' ? s.tabActive : {}) }}
                            onClick={() => setActiveTab('raw')}
                        >
                            📄 Raw Markdown
                        </button>
                        <button
                            style={{ ...s.tab, ...(activeTab === 'preview' ? s.tabActive : {}) }}
                            onClick={() => setActiveTab('preview')}
                        >
                            👁️ Preview
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'raw' ? (
                        <pre style={s.rawContent}>{readme}</pre>
                    ) : (
                        <div style={s.previewContent}>
                            {readme.split('\n').map((line, i) => {
                                if (line.startsWith('# ')) return <h1 key={i} style={s.mdH1}>{line.slice(2)}</h1>
                                if (line.startsWith('## ')) return <h2 key={i} style={s.mdH2}>{line.slice(3)}</h2>
                                if (line.startsWith('### ')) return <h3 key={i} style={s.mdH3}>{line.slice(4)}</h3>
                                if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} style={s.mdLi}>• {line.slice(2)}</div>
                                if (line.startsWith('```')) return <div key={i} style={s.mdCodeFence} />
                                if (line === '') return <div key={i} style={{ height: '8px' }} />
                                return <p key={i} style={s.mdP}>{line}</p>
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const s = {
    page: { padding: '40px', maxWidth: '1100px', margin: '0 auto' },

    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
    crumbLink: { color: 'var(--primary)', cursor: 'pointer', fontSize: '13px' },
    crumbSep: { color: 'var(--text-muted)', fontSize: '13px' },
    crumbActive: { color: 'var(--text-primary)', fontSize: '13px' },
    title: { fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px' },
    subtitle: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },
    generateBtn: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(99,102,241,0.3)', whiteSpace: 'nowrap' },
    btnSpinner: { width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' },

    infoBar: { display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: '24px', gap: '24px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    infoIcon: { fontSize: '16px' },
    infoLabel: { fontSize: '12px', color: 'var(--text-muted)' },
    infoValue: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' },
    infoDivider: { width: '1px', height: '20px', background: 'var(--border-subtle)' },

    generatingBox: { background: 'var(--bg-surface)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)', padding: '48px', marginBottom: '24px' },
    generatingInner: { textAlign: 'center', maxWidth: '360px', margin: '0 auto' },
    generatingSpinner: { width: '48px', height: '48px', border: '3px solid var(--border-default)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' },
    generatingTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' },
    generatingDesc: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' },
    generatingSteps: { display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' },
    step: { display: 'flex', alignItems: 'center', gap: '10px' },
    stepDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 },
    stepText: { fontSize: '13px', color: 'var(--text-secondary)' },

    errorBox: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' },
    errorIcon: { fontSize: '18px' },
    errorText: { fontSize: '13px', color: 'var(--danger)' },

    emptyBox: { background: 'var(--bg-surface)', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '60px 40px', textAlign: 'center' },
    emptyIcon: { fontSize: '52px', marginBottom: '16px' },
    emptyTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' },
    emptyDesc: { fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px', lineHeight: '1.7' },
    emptyFeatures: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' },
    emptyTag: { background: 'var(--primary-subtle)', color: 'var(--text-accent)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '500' },

    resultBox: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
    resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', flexWrap: 'wrap', gap: '12px' },
    resultLeft: {},
    successBadge: { fontSize: '14px', fontWeight: '700', color: '#22c55e', marginBottom: '2px' },
    resultMeta: { fontSize: '12px', color: 'var(--text-muted)' },
    resultActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    copyBtn: { background: 'var(--bg-overlay)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '7px 14px', fontSize: '13px', cursor: 'pointer' },
    downloadBtn: { background: '#22c55e', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '7px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    regenerateBtn: { background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '7px 14px', fontSize: '13px', cursor: 'pointer' },

    tabs: { display: 'flex', gap: '0', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' },
    tab: { padding: '10px 20px', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', transition: 'var(--transition)' },
    tabActive: { color: 'var(--primary)', borderBottomColor: 'var(--primary)' },

    rawContent: { padding: '24px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: '"JetBrains Mono", "Fira Code", monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, maxHeight: '600px', overflowY: 'auto', lineHeight: '1.7' },
    previewContent: { padding: '32px', maxHeight: '600px', overflowY: 'auto' },

    mdH1: { fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' },
    mdH2: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '24px 0 12px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' },
    mdH3: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '16px 0 8px' },
    mdP: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '8px' },
    mdLi: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '4px', paddingLeft: '16px' },
    mdCodeFence: { height: '1px', background: 'var(--border-subtle)', margin: '8px 0' },

    center: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' },
    spinner: { width: '32px', height: '32px', border: '3px solid var(--border-default)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: 'var(--text-secondary)', fontSize: '14px' },
}
