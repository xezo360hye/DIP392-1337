import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req: Request, res: Response) => {
    const sessions = await prisma.session.findMany({
        include: { course: true },
    })
    res.json(sessions)
})

router.get('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const session = await prisma.session.findUnique({ where: { id } })
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session)
})

router.post('/', async (req: Request, res: Response) => {
    const { courseId, dateTime } = req.body
    const session = await prisma.session.create({
        data: { courseId, dateTime: new Date(dateTime) },
    })
    res.json(session)
})

router.put('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { courseId, dateTime } = req.body
    const session = await prisma.session.update({
        where: { id },
        data: { courseId, dateTime: new Date(dateTime) },
    })
    res.json(session)
})

router.delete('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    await prisma.session.delete({ where: { id } })
    res.json({ success: true })
})

export default router
