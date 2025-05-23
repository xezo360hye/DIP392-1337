import { useEffect, useState } from 'react'
import styles from './StudentsTable.module.css'
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
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import axios from 'axios'

type Student = {
    id: number
    name: string
    surname: string
    contactInfo: string
}

export default function StudentsTable({ token }: { token: string }) {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editStudent, setEditStudent] = useState<Student | null>(null)
    const [form, setForm] = useState({ name: '', surname: '', contactInfo: '' })
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState<Student | null>(null)
    const [userAttendance, setUserAttendance] = useState<any[]>([])
    const [attendanceLoading, setAttendanceLoading] = useState(false)
    const [attendanceError, setAttendanceError] = useState('')

    useEffect(() => {
        fetchStudents()
    }, [])

    async function fetchStudents() {
        setLoading(true)
        try {
            const res = await axios.get('http://localhost:5000/api/students', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setStudents(res.data)
        } catch {
            setError('Could not fetch students')
        }
        setLoading(false)
    }

    function handleOpenCreate() {
        setEditStudent(null)
        setForm({ name: '', surname: '', contactInfo: '' })
        setOpen(true)
        setError('')
    }

    function handleOpenEdit(student: Student) {
        setEditStudent(student)
        setForm({
            name: student.name,
            surname: student.surname,
            contactInfo: student.contactInfo,
        })
        setOpen(true)
        setError('')
    }

    async function handleSubmit() {
        if (!form.name.trim() || !form.surname.trim()) {
            setError('Name and surname are required')
            return
        }
        try {
            if (editStudent) {
                await axios.put(
                    `http://localhost:5000/api/students/${editStudent.id}`,
                    form,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            } else {
                await axios.post('http://localhost:5000/api/students', form, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            }
            setOpen(false)
            fetchStudents()
        } catch {
            setError('Failed to save student')
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Are you sure you want to delete this student?'))
            return
        try {
            await axios.delete(`http://localhost:5000/api/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            fetchStudents()
        } catch {
            alert('Failed to delete student')
        }
    }

    async function handleOpenAttendance(user: Student) {
        setSelectedUser(user)
        setAttendanceLoading(true)
        setAttendanceError('')
        try {
            const attRes = await axios.get(
                'http://localhost:5000/api/attendance',
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            const records = attRes.data.filter(
                (rec: any) => rec.studentId === user.id
            )

            const [sessionsRes, coursesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/sessions', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('http://localhost:5000/api/courses', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])
            const sessions = sessionsRes.data
            const courses = coursesRes.data

            const data = records.map((rec: any) => {
                const session = sessions.find(
                    (s: any) => s.id === rec.sessionId
                )
                const course = session
                    ? courses.find((c: any) => c.id === session.courseId)
                    : null
                return {
                    dateTime: session ? session.dateTime : '-',
                    courseName: course ? course.name : '-',
                    attended: rec.attended,
                }
            })
            // .sort((a, b) => (a.dateTime < b.dateTime ? 1 : -1))

            setUserAttendance(data)
        } catch (e) {
            setAttendanceError('Could not load attendance.')
        }
        setAttendanceLoading(false)
    }

    function handleCloseAttendance() {
        setSelectedUser(null)
        setUserAttendance([])
        setAttendanceError('')
    }

    return (
        <div>
            <div className={styles.toolbar}>
                <Typography variant="h6">Students</Typography>
                <div className={styles.toolbar}>
                    {/* <Typography variant="h6">Students: </Typography> */}
                    <TextField
                        className={styles.search}
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        variant="outlined"
                        sx={{ minWidth: 200 }}
                    />
                </div>

                <Button
                    startIcon={<Add />}
                    className={styles.addButton}
                    variant="contained"
                    onClick={handleOpenCreate}
                >
                    Add Student
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
                                <TableCell>Contact info</TableCell>
                                <TableCell width={110}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        No students found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students
                                    .filter((s) =>
                                        `${s.name} ${s.surname} ${s.contactInfo}`
                                            .toLowerCase()
                                            .includes(search.toLowerCase())
                                    )
                                    .map((student) => (
                                        <TableRow
                                            key={student.id}
                                            hover
                                            onClick={() =>
                                                handleOpenAttendance(student)
                                            }
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{student.id}</TableCell>
                                            <TableCell>
                                                {student.name}
                                            </TableCell>
                                            <TableCell>
                                                {student.surname}
                                            </TableCell>
                                            <TableCell>
                                                {student.contactInfo}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleOpenEdit(student)
                                                    }}
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(student.id)
                                                    }}
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
                    {editStudent ? 'Edit Student' : 'Add Student'}
                </DialogTitle>
                <DialogContent>
                    <form
                        className={styles.form}
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmit()
                        }}
                    >
                        <TextField
                            margin="dense"
                            label="Name"
                            fullWidth
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
                        />
                        <TextField
                            margin="dense"
                            label="Surname"
                            fullWidth
                            value={form.surname}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    surname: e.target.value,
                                }))
                            }
                            required
                        />
                        <TextField
                            margin="dense"
                            label="Contact info"
                            fullWidth
                            value={form.contactInfo}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    contactInfo: e.target.value,
                                }))
                            }
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
                        {editStudent ? 'Save' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={!!selectedUser}
                onClose={handleCloseAttendance}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Attendance for&nbsp;
                    <b>
                        {selectedUser?.name} {selectedUser?.surname}
                    </b>
                </DialogTitle>
                <DialogContent>
                    {attendanceLoading ? (
                        <Typography>Loading...</Typography>
                    ) : attendanceError ? (
                        <Typography color="error">{attendanceError}</Typography>
                    ) : userAttendance.length === 0 ? (
                        <Typography>No attendance records found.</Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date &amp; Time</TableCell>
                                    <TableCell>Course</TableCell>
                                    <TableCell>Attended</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userAttendance.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            {row.dateTime !== '-'
                                                ? new Date(
                                                      row.dateTime
                                                  ).toLocaleString([], {
                                                      dateStyle: 'medium',
                                                      timeStyle: 'short',
                                                  })
                                                : '-'}
                                        </TableCell>
                                        <TableCell>{row.courseName}</TableCell>
                                        <TableCell>
                                            {row.attended ? 'Yes' : 'No'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAttendance}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
