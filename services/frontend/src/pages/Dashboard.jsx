import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()

    return (
        <div style={styles.main}>
            <div style={styles.welcomeCard}>
                <h2 style={styles.welcomeTitle}>Welcome back, {user?.username}!</h2>
                <p style={styles.welcomeText}>
                    Select a repository to analyze your code with AI.
                </p>
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>0</span>
                        <span style={styles.statLabel}>Reports</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>0</span>
                        <span style={styles.statLabel}>Issues Found</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>0</span>
                        <span style={styles.statLabel}>Security Alerts</span>
                    </div>
                </div>
                <button style={styles.btn} onClick={() => navigate('/repos')}>
                    Browse Repositories →
                </button>
            </div>
        </div>
    )
}

const styles = {
    main: { maxWidth: '960px', margin: '40px auto', padding: '0 24px' },
    welcomeCard: { background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '32px' },
    welcomeTitle: { color: '#e6edf3', fontSize: '24px', fontWeight: '700', margin: '0 0 8px' },
    welcomeText: { color: '#8b949e', fontSize: '14px', margin: '0 0 24px' },
    statsRow: { display: 'flex', gap: '16px', marginBottom: '24px' },
    statCard: { background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    statNumber: { color: '#58a6ff', fontSize: '32px', fontWeight: '700' },
    statLabel: { color: '#8b949e', fontSize: '12px' },
    btn: { background: '#238636', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
}
