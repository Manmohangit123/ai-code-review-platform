import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '⬛' },
    { label: 'Repositories', path: '/repos', icon: '📁' },
    { label: 'Analytics', path: '/analytics', icon: '📊' },
]

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path) => location.pathname.startsWith(path)

    return (
        <div style={s.root}>
            {/* Sidebar */}
            <aside style={s.sidebar}>
                {/* Logo */}
                <div style={s.logo} onClick={() => navigate('/dashboard')}>
                    <div style={s.logoIcon}>
                        <span style={{ fontSize: '16px' }}>⚡</span>
                    </div>
                    <div>
                        <div style={s.logoTitle}>CodeAI</div>
                        <div style={s.logoSub}>Review Platform</div>
                    </div>
                </div>

                <div style={s.divider} />

                {/* Nav */}
                <nav style={s.nav}>
                    <div style={s.navSection}>MENU</div>
                    {navItems.map(item => (
                        <div
                            key={item.path}
                            style={{ ...s.navItem, ...(isActive(item.path) ? s.navItemActive : {}) }}
                            onClick={() => navigate(item.path)}
                        >
                            <span style={s.navIcon}>{item.icon}</span>
                            <span style={s.navLabel}>{item.label}</span>
                            {isActive(item.path) && <div style={s.navIndicator} />}
                        </div>
                    ))}
                </nav>

                <div style={{ flex: 1 }} />

                {/* User Profile */}
                <div style={s.userSection}>
                    <div style={s.divider} />
                    <div style={s.userCard}>
                        <img src={user?.avatar_url} alt="avatar" style={s.avatar} />
                        <div style={s.userInfo}>
                            <div style={s.userName}>{user?.username}</div>
                            <div style={s.userRole}>Developer</div>
                        </div>
                        <button style={s.logoutBtn} onClick={logout} title="Logout">↗</button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={s.main}>
                <Outlet />
            </main>
        </div>
    )
}

const s = {
    root: { display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' },

    sidebar: {
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
    },

    logo: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '20px 16px 16px',
        cursor: 'pointer',
    },
    logoIcon: {
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 16px rgba(99,102,241,0.4)',
    },
    logoTitle: { fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 },
    logoSub: { fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },

    divider: { height: '1px', background: 'var(--border-subtle)', margin: '0 16px' },

    nav: { padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' },
    navSection: { fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '1px', padding: '8px 12px 4px', textTransform: 'uppercase' },

    navItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: 'var(--radius-sm)',
        cursor: 'pointer', transition: 'var(--transition)',
        color: 'var(--text-secondary)', fontSize: '13.5px', fontWeight: '500',
        position: 'relative',
    },
    navItemActive: {
        background: 'var(--primary-subtle)',
        color: 'var(--text-accent)',
    },
    navIcon: { fontSize: '14px', width: '18px', textAlign: 'center' },
    navLabel: { flex: 1 },
    navIndicator: {
        width: '3px', height: '16px', borderRadius: '2px',
        background: 'var(--primary)',
    },

    userSection: { padding: '0 0 8px' },
    userCard: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', margin: '8px 8px 0',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-elevated)',
    },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border-default)' },
    userInfo: { flex: 1, overflow: 'hidden' },
    userName: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    userRole: { fontSize: '11px', color: 'var(--text-muted)' },
    logoutBtn: {
        background: 'transparent', border: 'none', color: 'var(--text-muted)',
        cursor: 'pointer', fontSize: '16px', padding: '4px',
        borderRadius: '4px', transition: 'var(--transition)',
    },

    main: {
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        minHeight: '100vh',
        background: 'var(--bg-base)',
        overflow: 'auto',
    },
}
