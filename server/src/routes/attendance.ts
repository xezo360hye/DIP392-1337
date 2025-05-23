import express, { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware as express.RequestHandler)

router.get('/', async (req: Request, res: Response) => {
    const attendances = await prisma.attendance.findMany({
        include: {
            student: true,
            session: true,
        },
    })
    res.json(attendances)
})

router.get('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const record = await prisma.attendance.findUnique({ where: { id } })
    if (!record) return res.status(404).json({ error: 'Attendance not found' })
    res.json(record)
})

router.post('/', async (req: Request, res: Response) => {
    const { studentId, sessionId, attended, notesPrivate, notesPublic } =
        req.body
    const attendance = await prisma.attendance.upsert({
        where: {
            studentId_sessionId: {
                studentId,
                sessionId,
            },
        },
        update: { attended, notesPrivate, notesPublic },
        create: { studentId, sessionId, attended, notesPrivate, notesPublic },
    })
    res.json(attendance)
})

router.put('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { attended, notesPrivate, notesPublic } = req.body
    const record = await prisma.attendance.update({
        where: { id },
        data: { attended, notesPrivate, notesPublic },
    })
    res.json(record)
})

router.delete('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    await prisma.attendance.delete({ where: { id } })
    res.json({ success: true })
})

export default router
