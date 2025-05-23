import { Router } from 'express'
import type { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()
const prisma = new PrismaClient()

router.post('/login', async function (req: Request, res: Response) {
    const { login, password } = req.body
    const admin = await prisma.admin.findFirst({ where: { login } })
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign(
        { userId: admin.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    )
    res.json({ token })
})

export default router
