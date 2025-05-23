import { useState } from 'react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './Dashboard.module.css'
import StudentsTable from './StudentsTable'
import SessionsTable from './SessionsTable'
import AttendanceTable from './AttendanceTable'
import CoursesTable from './CoursesTable'

type TabType = 'students' | 'sessions' | 'attendance' | 'courses'

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
    const [tab, setTab] = useState<TabType>('students')

    return (
        <div className={styles.wrapper}>
            <NavBar active={tab} onChange={setTab} onLogout={onLogout} />
            <main className={styles.content}>
                {tab === 'students' && (
                    <StudentsTable token={localStorage.getItem('token')!} />
                )}

                {tab === 'sessions' && (
                    <SessionsTable token={localStorage.getItem('token')!} />
                )}

                {tab === 'attendance' && (
                    <AttendanceTable token={localStorage.getItem('token')!} />
                )}

                {tab === 'courses' && (
                    <CoursesTable token={localStorage.getItem('token')!} />
                )}
            </main>
        </div>
    )
}
