import { Component } from 'react'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={s.page}>
                    <div style={s.card}>
                        <div style={s.icon}>⚠️</div>
                        <h2 style={s.title}>Something went wrong</h2>
                        <p style={s.desc}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
                        <button style={s.btn} onClick={() => window.location.href = '/dashboard'}>
                            Go to Dashboard
                        </button>
                        <button style={s.btnSecondary} onClick={() => this.setState({ hasError: false, error: null })}>
                            Try Again
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

const s = {
    page: { minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
    card: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '48px 40px', maxWidth: '460px', width: '100%', textAlign: 'center' },
    icon: { fontSize: '52px', marginBottom: '16px' },
    title: { fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' },
    desc: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: '1.6' },
    btn: { width: '100%', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' },
    btnSecondary: { width: '100%', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '14px', cursor: 'pointer' },
}
