export default function Login() {
    const handleLogin = () => {
        window.location.href = 'http://localhost:3001/auth/github'
    }

    const features = [
        { icon: '🤖', title: 'AI Code Review', desc: 'Instant analysis of code quality, bugs, and best practices' },
        { icon: '🛡️', title: 'Security Scanner', desc: 'Detect OWASP vulnerabilities before they reach production' },
        { icon: '⚡', title: 'Performance Audit', desc: 'Find bottlenecks and optimize your application' },
        { icon: '📝', title: 'README Generator', desc: 'Auto-generate professional documentation for any repo' },
    ]

    return (
        <div style={s.root}>
            {/* Left Panel */}
            <div style={s.left}>
                <div style={s.leftContent}>
                    <div style={s.brand}>
                        <div style={s.brandIcon}>⚡</div>
                        <span style={s.brandName}>CodeAI</span>
                    </div>
                    <h1 style={s.headline}>Code smarter.<br />Ship faster.</h1>
                    <p style={s.tagline}>AI-powered code reviews that catch bugs, security vulnerabilities, and performance issues before they reach production.</p>

                    <div style={s.featureGrid}>
                        {features.map((f, i) => (
                            <div key={i} style={s.featureCard}>
                                <span style={s.featureIcon}>{f.icon}</span>
                                <div>
                                    <div style={s.featureTitle}>{f.title}</div>
                                    <div style={s.featureDesc}>{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={s.right}>
                <div style={s.card}>
                    <div style={s.cardTop}>
                        <div style={s.cardIcon}>⚡</div>
                        <h2 style={s.cardTitle}>Welcome to CodeAI</h2>
                        <p style={s.cardSub}>Sign in to start reviewing your code with AI</p>
                    </div>

                    <button style={s.githubBtn} onClick={handleLogin}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        Continue with GitHub
                    </button>

                    <div style={s.divider}>
                        <div style={s.dividerLine} />
                        <span style={s.dividerText}>Secure OAuth 2.0</span>
                        <div style={s.dividerLine} />
                    </div>

                    <div style={s.trustList}>
                        {['✓ Read-only repository access', '✓ No code stored on our servers', '✓ AI runs locally via Ollama', '✓ Your data stays private'].map((t, i) => (
                            <div key={i} style={s.trustItem}>{t}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const s = {
    root: { display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' },

    left: {
        flex: 1, background: 'linear-gradient(135deg, #07071a 0%, #0d0d20 100%)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px',
    },
    leftContent: { maxWidth: '480px' },
    brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' },
    brandIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 0 20px rgba(99,102,241,0.4)' },
    brandName: { fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' },

    headline: { fontSize: '48px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.15', marginBottom: '16px' },
    tagline: { fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '40px' },

    featureGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    featureCard: { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' },
    featureIcon: { fontSize: '20px', flexShrink: 0 },
    featureTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' },
    featureDesc: { fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' },

    right: { width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' },
    card: { width: '100%', maxWidth: '360px' },
    cardTop: { textAlign: 'center', marginBottom: '32px' },
    cardIcon: { width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 16px', boxShadow: '0 0 24px rgba(99,102,241,0.4)' },
    cardTitle: { fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' },
    cardSub: { fontSize: '14px', color: 'var(--text-secondary)' },

    githubBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        width: '100%', padding: '14px 24px',
        background: 'linear-gradient(135deg, #1a1a2e, #252540)',
        border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)',
        color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
        transition: 'var(--transition)', marginBottom: '24px',
    },

    divider: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
    dividerLine: { flex: 1, height: '1px', background: 'var(--border-subtle)' },
    dividerText: { fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' },

    trustList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    trustItem: { fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' },
}
