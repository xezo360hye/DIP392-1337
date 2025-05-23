import { useEffect, useState } from 'react'
import styles from './SessionsTable.module.css'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import axios from 'axios'

type Session = {
    id: number
    courseId: number
    dateTime: string
}

type Course = { id: number; name: string }

export default function SessionsTable({ token }: { token: string }) {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editSession, setEditSession] = useState<Session | null>(null)
    const [form, setForm] = useState({ courseId: 1, dateTime: '' })
    const [error, setError] = useState('')
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedMonth, setSelectedMonth] = useState('')

    useEffect(() => {
        async function fetchCourses() {
            const res = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setCourses(res.data)
        }
        fetchCourses()
        fetchSessions()
    }, [token])

    async function fetchSessions() {
        setLoading(true)
        try {
            const res = await axios.get('http://localhost:5000/api/sessions', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setSessions(res.data)
        } catch {
            setError('Could not fetch sessions')
        }
        setLoading(false)
    }

    function handleOpenCreate() {
        setEditSession(null)
        setForm({ courseId: 1, dateTime: '' })
        setOpen(true)
        setError('')
    }

    function handleOpenEdit(session: Session) {
        setEditSession(session)
        setForm({
            courseId: session.courseId,
            dateTime: session.dateTime ? session.dateTime.slice(0, 16) : '',
        })
        setOpen(true)
        setError('')
    }

    async function handleSubmit() {
        if (!form.dateTime) {
            setError('Date and time are required')
            return
        }
        try {
            if (editSession) {
                await axios.put(
                    `http://localhost:5000/api/sessions/${editSession.id}`,
                    {
                        ...form,
                        dateTime: new Date(form.dateTime).toISOString(),
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            } else {
                await axios.post(
                    'http://localhost:5000/api/sessions',
                    {
                        ...form,
                        dateTime: new Date(form.dateTime).toISOString(),
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            }
            setOpen(false)
            fetchSessions()
        } catch {
            setError('Failed to save session')
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Are you sure you want to delete this session?'))
            return
        try {
            await axios.delete(`http://localhost:5000/api/sessions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            fetchSessions()
        } catch {
            alert('Failed to delete session')
        }
    }

    function getMonthStr(dateStr: string) {
        const d = new Date(dateStr)
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    }

    const months = Array.from(
        new Set(sessions.map((s) => getMonthStr(s.dateTime)))
    ).sort((a, b) => b.localeCompare(a))

    const filteredSessions = selectedMonth
        ? sessions.filter((s) => getMonthStr(s.dateTime) === selectedMonth)
        : sessions

    return (
        <div>
            <div className={styles.toolbar}>
                <Typography variant="h6" className={styles.title}>
                    Session
                </Typography>
                <div className={styles.toolbarLeft}>
                    <FormControl className={styles.monthSelect}>
                        {/* <InputLabel>Month</InputLabel> */}
                        <Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            // label="Month"
                            displayEmpty
                        >
                            <MenuItem value="">All months</MenuItem>
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
                    {/* <Typography variant="h6" style={{ marginRight: 18 }}>
                        Sessions (Lessons)
                    </Typography> */}
                </div>
                <Button
                    startIcon={<Add />}
                    className={styles.addButton}
                    variant="contained"
                    onClick={handleOpenCreate}
                >
                    Add Session
                </Button>
            </div>
            <div className={styles.tableWrapper}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width={80}>ID</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Date &amp; Time</TableCell>
                                <TableCell width={110}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredSessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        No sessions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell>{session.id}</TableCell>
                                        <TableCell>
                                            {courses.find(
                                                (c) => c.id === session.courseId
                                            )?.name || session.courseId}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                session.dateTime
                                            ).toLocaleString([], {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                onClick={() =>
                                                    handleOpenEdit(session)
                                                }
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    handleDelete(session.id)
                                                }
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    {editSession ? 'Edit Session' : 'Add Session'}
                </DialogTitle>
                <DialogContent>
                    <form
                        className={styles.form}
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmit()
                        }}
                    >
                        <Select
                            label="Course"
                            value={form.courseId}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    courseId: Number(e.target.value),
                                }))
                            }
                            fullWidth
                            margin="dense"
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                Select course
                            </MenuItem>
                            {courses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                    {course.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <TextField
                            margin="dense"
                            label="Date and Time"
                            fullWidth
                            type="datetime-local"
                            value={form.dateTime}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    dateTime: e.target.value,
                                }))
                            }
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        {error && (
                            <Typography color="error" fontSize={14}>
                                {error}
                            </Typography>
                        )}
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editSession ? 'Save' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
