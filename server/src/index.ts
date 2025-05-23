import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import studentRoutes from './routes/student'
import attendanceRoutes from './routes/attendance'
import sessionRoutes from './routes/session'
import courseRoutes from './routes/course'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/courses', courseRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {})
