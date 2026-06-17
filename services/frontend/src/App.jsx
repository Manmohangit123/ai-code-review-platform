import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AuthSuccess from './pages/AuthSuccess'
import Repositories from './pages/Repositories'
import RepoDetail from './pages/RepoDetail'
import FileViewer from './pages/FileViewer'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppRoutes() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0d1117' }}>
                <p style={{ color: '#58a6ff', fontSize: '18px' }}>Loading...</p>
            </div>
        )
    }

    return (
        <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route element={user ? <Layout /> : <Navigate to="/" />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/repos" element={<Repositories />} />
                <Route path="/repos/:owner/:repo" element={<RepoDetail />} />
                <Route path="/repos/:owner/:repo/file" element={<FileViewer />} />
            </Route>
        </Routes>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}
