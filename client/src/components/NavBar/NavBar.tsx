import styles from './NavBar.module.css'
import MenuIcon from '@mui/icons-material/Menu'
import { useState } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { IconButton, Menu, MenuItem } from '@mui/material'

type TabType = 'students' | 'sessions' | 'attendance' | 'courses'

type NavBarProps = {
    active: TabType
    onChange: (tab: TabType) => void
    onLogout: () => void
}

const navItems: { key: TabType; label: string }[] = [
    { key: 'students', label: 'Students' },
    { key: 'sessions', label: 'Sessions' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'courses', label: 'Courses' },
]

export default function NavBar({ active, onChange, onLogout }: NavBarProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const isMobile = useMediaQuery('(max-width:700px)')

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleChange = (tab: TabType) => {
        onChange(tab)
        handleClose()
    }

    return (
        <nav className={styles.root}>
            <span className={styles.logo}>Attendance Admin</span>
            {!isMobile ? (
                <>
                    <div className={styles.links}>
                        {navItems.map((item) => (
                            <span
                                key={item.key}
                                className={
                                    active === item.key
                                        ? `${styles.link} ${styles.linkActive}`
                                        : styles.link
                                }
                                onClick={() => onChange(item.key)}
                            >
                                {item.label}
                            </span>
                        ))}
                    </div>
                    <div className={styles.right}>
                        <button
                            className={styles.logoutButton}
                            onClick={onLogout}
                        >
                            Logout
                        </button>
                    </div>
                </>
            ) : (
                <div className={styles.right}>
                    <IconButton
                        edge="end"
                        color="primary"
                        aria-label="menu"
                        onClick={handleMenu}
                        className={styles.burgerButton}
                    >
                        <MenuIcon fontSize="large" />
                    </IconButton>
                </div>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {navItems.map((item) => (
                    <MenuItem
                        key={item.key}
                        selected={active === item.key}
                        onClick={() => handleChange(item.key)}
                    >
                        {item.label}
                    </MenuItem>
                ))}
                <MenuItem
                    onClick={() => {
                        handleClose()
                        onLogout()
                    }}
                    sx={{ color: '#d32f2f', fontWeight: 600 }}
                >
                    Logout
                </MenuItem>
            </Menu>
        </nav>
    )
}
