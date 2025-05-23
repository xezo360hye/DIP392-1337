import { useEffect, useState } from 'react'
import styles from './CoursesTable.module.css'
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

type Course = {
    id: number
    name: string
}

export default function CoursesTable({ token }: { token: string }) {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editCourse, setEditCourse] = useState<Course | null>(null)
    const [form, setForm] = useState({ name: '' })
    const [error, setError] = useState('')

    useEffect(() => {
        fetchCourses()
    }, [])

    async function fetchCourses() {
        setLoading(true)
        try {
            const res = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setCourses(res.data)
        } catch {
            setError('Could not fetch courses')
        }
        setLoading(false)
    }

    function handleOpenCreate() {
        setEditCourse(null)
        setForm({ name: '' })
        setOpen(true)
        setError('')
    }

    function handleOpenEdit(course: Course) {
        setEditCourse(course)
        setForm({ name: course.name })
        setOpen(true)
        setError('')
    }

    async function handleSubmit() {
        if (!form.name.trim()) {
            setError('Course name is required')
            return
        }
        try {
            if (editCourse) {
                await axios.put(
                    `http://localhost:5000/api/courses/${editCourse.id}`,
                    form,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            } else {
                await axios.post('http://localhost:5000/api/courses', form, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            }
            setOpen(false)
            fetchCourses()
        } catch {
            setError('Failed to save course')
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Are you sure you want to delete this course?'))
            return
        try {
            await axios.delete(`http://localhost:5000/api/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            fetchCourses()
        } catch {
            alert('Failed to delete course')
        }
    }

    return (
        <div>
            <div className={styles.toolbar}>
                <Typography variant="h6">Courses</Typography>
                <Button
                    startIcon={<Add />}
                    className={styles.addButton}
                    variant="contained"
                    onClick={handleOpenCreate}
                >
                    Add Course
                </Button>
            </div>
            <div className={styles.tableWrapper}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width={80}>ID</TableCell>
                                <TableCell>Course Name</TableCell>
                                <TableCell width={110}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        No courses found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell>{course.id}</TableCell>
                                        <TableCell>{course.name}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                onClick={() =>
                                                    handleOpenEdit(course)
                                                }
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    handleDelete(course.id)
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
                    {editCourse ? 'Edit Course' : 'Add Course'}
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
                            label="Course Name"
                            fullWidth
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
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
                        {editCourse ? 'Save' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
