import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const navItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Repositories', path: '/repos' },
        { label: '📊 Analytics', path: '/analytics' }
    ]

    return (
        <div style={styles.wrapper}>
            <nav style={styles.nav}>
                <span style={styles.brand} onClick={() => navigate('/dashboard')}>
                    AI Code Review
                </span>
                <div style={styles.navLinks}>
                    {navItems.map(item => (
                        <span
                            key={item.path}
                            style={{
                                ...styles.navLink,
                                ...(location.pathname.startsWith(item.path) ? styles.navLinkActive : {})
                            }}
                            onClick={() => navigate(item.path)}
                        >
                            {item.label}
                        </span>
                    ))}
                </div>
                <div style={styles.navRight}>
                    <img src={user?.avatar_url} alt="avatar" style={styles.avatar} />
                    <span style={styles.username}>@{user?.username}</span>
                    <button style={styles.logoutBtn} onClick={logout}>Logout</button>
                </div>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    )
}

const styles = {
    wrapper: { minHeight: '100vh', background: '#0d1117', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    nav: { background: '#161b22', borderBottom: '1px solid #30363d', padding: '0 32px', display: 'flex', alignItems: 'center', height: '56px', gap: '24px' },
    brand: { color: '#58a6ff', fontSize: '18px', fontWeight: '700', cursor: 'pointer', marginRight: '8px' },
    navLinks: { display: 'flex', gap: '4px', flex: 1 },
    navLink: { color: '#8b949e', fontSize: '14px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' },
    navLinkActive: { color: '#e6edf3', background: '#21262d' },
    navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
    avatar: { width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #30363d' },
    username: { color: '#e6edf3', fontSize: '13px' },
    logoutBtn: { background: 'transparent', border: '1px solid #30363d', color: '#8b949e', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
}
