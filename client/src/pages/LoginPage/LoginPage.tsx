import styles from './LoginPage.module.css'
import { useState } from 'react'
import { TextField, Button, Typography, Paper } from '@mui/material'
import axios from 'axios'

type Props = {
    onLogin: (token: string) => void
}

export default function LoginPage({ onLogin }: Props) {
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await axios.post(
                'http://localhost:5000/api/auth/login',
                { login, password }
            )
            onLogin(res.data.token)
        } catch {
            setError('Wrong login or password')
        }
    }

    return (
        <div className={styles.root}>
            <Paper className={styles.loginPaper} elevation={2}>
                <Typography variant="h5" align="center" gutterBottom>
                    Admin Login
                </Typography>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <TextField
                        label="Login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        autoComplete="username"
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        fullWidth
                        variant="outlined"
                    />
                    {error && <div className={styles.error}>{error}</div>}
                    <Button type="submit" variant="contained" fullWidth>
                        Login
                    </Button>
                </form>
            </Paper>
        </div>
    )
}
