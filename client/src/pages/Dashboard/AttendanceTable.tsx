import { useEffect, useState } from 'react'
import styles from './AttendanceTable.module.css'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    MenuItem,
    Select,
    Typography,
    Checkbox,
    CircularProgress,
    FormControl,
    InputLabel,
} from '@mui/material'
import axios from 'axios'

type Student = {
    id: number
    name: string
    surname: string
    contactInfo: string
}

type Session = {
    id: number
    dateTime: string
    courseId: number
    topic?: string
}

type Course = {
    id: number
    name: string
}

type AttendanceRecord = {
    id?: number
    studentId: number
    sessionId: number
    attended: boolean
}

export default function AttendanceTable({ token }: { token: string }) {
    const [sessions, setSessions] = useState<Session[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [selectedMonth, setSelectedMonth] = useState('')
    const [selectedSession, setSelectedSession] = useState<number | ''>('')
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchSessions()
        fetchCourses()
        fetchStudents()
    }, [])

    useEffect(() => {
        if (selectedSession) fetchAttendance(Number(selectedSession))
    }, [selectedSession, students])

    async function fetchSessions() {
        try {
            const res = await axios.get('http://localhost:5000/api/sessions', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setSessions(res.data)
            setLoading(false)
        } catch {
            setError('Could not fetch sessions')
            setLoading(false)
        }
    }

    async function fetchCourses() {
        try {
            const res = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setCourses(res.data)
        } catch {
            setError('Could not fetch courses')
        }
    }

    async function fetchStudents() {
        try {
            const res = await axios.get('http://localhost:5000/api/students', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setStudents(res.data)
        } catch {
            setError('Could not fetch students')
        }
    }

    async function fetchAttendance(sessionId: number) {
        setLoading(true)
        try {
            const res = await axios.get(
                'http://localhost:5000/api/attendance',
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            const filtered = res.data.filter(
                (a: AttendanceRecord) => a.sessionId === sessionId
            )
            const attendanceMap: { [studentId: number]: AttendanceRecord } = {}
            filtered.forEach((rec: AttendanceRecord) => {
                attendanceMap[rec.studentId] = rec
            })
            const merged = students.map(
                (student) =>
                    attendanceMap[student.id] || {
                        studentId: student.id,
                        sessionId,
                        attended: false,
                    }
            )
            setAttendance(merged)
        } catch {
            setError('Could not fetch attendance')
        }
        setLoading(false)
    }

    function handleChange(studentId: number, attended: boolean) {
        setAttendance((prev) =>
            prev.map((a) =>
                a.studentId === studentId ? { ...a, attended } : a
            )
        )
    }

    async function handleSave() {
        setSaving(true)
        try {
            for (const record of attendance) {
                if (record.id) {
                    await axios.put(
                        `http://localhost:5000/api/attendance/${record.id}`,
                        { attended: record.attended },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                } else {
                    await axios.post(
                        `http://localhost:5000/api/attendance`,
                        {
                            studentId: record.studentId,
                            sessionId: record.sessionId,
                            attended: record.attended,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                }
            }
            fetchAttendance(Number(selectedSession))
        } catch {
            setError('Failed to save attendance')
        }
        setSaving(false)
    }

    function getMonthStr(dateStr: string) {
        const d = new Date(dateStr)
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    }

    const months = Array.from(
        new Set(sessions.map((s) => getMonthStr(s.dateTime)))
    ).sort((a, b) => b.localeCompare(a))

    const sessionsInMonth = sessions.filter(
        (s) => getMonthStr(s.dateTime) === selectedMonth
    )

    useEffect(() => {
        if (!selectedMonth && months.length > 0) {
            setSelectedMonth(months[0])
        }
    }, [months, selectedMonth])

    useEffect(() => {
        setSelectedSession('')
    }, [selectedMonth])

    return (
        <div>
            <div className={styles.toolbar}>
                <Typography variant="h6" className={styles.title}>
                    Attendance
                </Typography>
                <FormControl className={styles.select}>
                    <InputLabel>Month</InputLabel>
                    <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        label="Month"
                        style={{ minWidth: 200 }}
                    >
                        {months.map((month) => (
                            <MenuItem key={month} value={month}>
                                {new Date(month + '-01').toLocaleString(
                                    'default',
                                    { month: 'long', year: 'numeric' }
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl className={styles.select}>
                    <InputLabel>Session</InputLabel>
                    <Select
                        value={selectedSession}
                        onChange={(e) =>
                            setSelectedSession(Number(e.target.value))
                        }
                        label="Session"
                        disabled={
                            !selectedMonth || sessionsInMonth.length === 0
                        }
                        style={{ minWidth: 200 }}
                    >
                        {sessionsInMonth.map((session) => (
                            <MenuItem key={session.id} value={session.id}>
                                {courses.find((c) => c.id === session.courseId)
                                    ?.name || ''}
                                {' — '}
                                {new Date(session.dateTime).toLocaleString([], {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                                {session.topic ? ` — ${session.topic}` : ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    style={{ marginLeft: 'auto' }}
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={saving || loading || !selectedSession}
                >
                    {saving ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        'Save Attendance'
                    )}
                </Button>
            </div>

            <div className={styles.tableWrapper}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width={80}>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Surname</TableCell>
                                <TableCell align="center">Attended</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        style={{ color: 'red' }}
                                    >
                                        {error}
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        No students
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => {
                                    const rec = attendance.find(
                                        (a) => a.studentId === student.id
                                    )
                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.id}</TableCell>
                                            <TableCell>
                                                {student.name}
                                            </TableCell>
                                            <TableCell>
                                                {student.surname}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Checkbox
                                                    checked={!!rec?.attended}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            student.id,
                                                            e.target.checked
                                                        )
                                                    }
                                                    color="primary"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            {error && (
                <Typography color="error" style={{ marginTop: 16 }}>
                    {error}
                </Typography>
            )}
        </div>
    )
}
