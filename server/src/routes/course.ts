import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const prisma = new PrismaClient()
router.use(authMiddleware)

router.get('/', async (req, res) => {
    const courses = await prisma.course.findMany()
    res.json(courses)
})

router.post('/', async (req, res) => {
    const { name } = req.body
    const course = await prisma.course.create({ data: { name } })
    res.json(course)
})

router.put('/:id', async (req, res) => {
    const id = Number(req.params.id)
    const { name } = req.body
    const course = await prisma.course.update({ where: { id }, data: { name } })
    res.json(course)
})

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id)
    await prisma.course.delete({ where: { id } })
    res.json({ success: true })
})

export default router
