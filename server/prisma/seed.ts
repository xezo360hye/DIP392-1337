import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const login = 'admin'
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.admin.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            login: login,
            password: hashedPassword,
        },
    })
}

main()
    .catch((e) => {
        process.exit(1)
    })
    .finally(async () => {
        prisma.$disconnect()
    })
