import { useState } from 'react'
import LoginPage from './pages/LoginPage/LoginPage'
import Dashboard from './pages/Dashboard/Dashboard'

function App() {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('token')
    )

    const handleLogin = (token: string) => {
        setToken(token)
        localStorage.setItem('token', token)
    }

    const handleLogout = () => {
        setToken(null)
        localStorage.removeItem('token')
    }

    if (!token) return <LoginPage onLogin={handleLogin} />

    return <Dashboard onLogout={handleLogout} />
}

export default App
