import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.navTitle}>AI Code Review</h1>
        <div style={styles.navRight}>
          <img src={user?.avatar_url} alt="avatar" style={styles.avatar} />
          <span style={styles.username}>@{user?.username}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <h2 style={styles.welcomeTitle}>Welcome back, {user?.username}!</h2>
          <p style={styles.welcomeText}>
            You're now logged in. Next we'll connect your GitHub repositories and start analyzing code.
          </p>
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>Repositories</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>Reports</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>Issues Found</span>
            </div>
          </div>
        </div>

        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No repositories connected yet.</p>
          <p style={styles.emptySubtext}>Phase 2 coming soon — you'll be able to browse and analyze your repos here.</p>
        </div>
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0d1117',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  nav: {
    background: '#161b22',
    borderBottom: '1px solid #30363d',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  navTitle: {
    color: '#58a6ff',
    fontSize: '20px',
    fontWeight: '700',
    margin: 0
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid #30363d'
  },
  username: {
    color: '#e6edf3',
    fontSize: '14px'
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #30363d',
    color: '#8b949e',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  main: {
    maxWidth: '960px',
    margin: '40px auto',
    padding: '0 24px'
  },
  welcomeCard: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px'
  },
  welcomeTitle: {
    color: '#e6edf3',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px'
  },
  welcomeText: {
    color: '#8b949e',
    fontSize: '14px',
    margin: '0 0 24px'
  },
  statsRow: {
    display: 'flex',
    gap: '16px'
  },
  statCard: {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '20px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  statNumber: {
    color: '#58a6ff',
    fontSize: '32px',
    fontWeight: '700'
  },
  statLabel: {
    color: '#8b949e',
    fontSize: '12px'
  },
  emptyState: {
    background: '#161b22',
    border: '1px dashed #30363d',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center'
  },
  emptyText: {
    color: '#e6edf3',
    fontSize: '16px',
    margin: '0 0 8px'
  },
  emptySubtext: {
    color: '#6e7681',
    fontSize: '13px',
    margin: 0
  }
}
