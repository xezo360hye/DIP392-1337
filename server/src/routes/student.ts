import express, { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware as express.RequestHandler)

router.get('/', async (req: Request, res: Response) => {
    const students = await prisma.student.findMany()
    res.json(students)
})

router.post('/', async (req: Request, res: Response) => {
    const { name, surname, contactInfo } = req.body
    const student = await prisma.student.create({
        data: { name, surname, contactInfo },
    })
    res.json(student)
})

router.get('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const student = await prisma.student.findUnique({ where: { id } })
    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json(student)
})

router.put('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { name, surname, contactInfo } = req.body
    const student = await prisma.student.update({
        where: { id },
        data: { name, surname, contactInfo },
    })
    res.json(student)
})

router.delete('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    await prisma.student.delete({ where: { id } })
    res.json({ success: true })
})

export default router
