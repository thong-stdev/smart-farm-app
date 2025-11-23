import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { username: 'farmer1' },
    })

    if (user) {
        console.log('✅ User found:')
        console.log('Username:', user.username)
        console.log('Email:', user.email)
        console.log('Role:', user.role)
        console.log('Password Hash:', user.password ? 'Present' : 'Missing')
    } else {
        console.log('❌ User "farmer1" not found!')

        // Check if any users exist
        const count = await prisma.user.count()
        console.log(`Total users in DB: ${count}`)

        if (count > 0) {
            const allUsers = await prisma.user.findMany({ select: { username: true, email: true } })
            console.log('Existing users:', allUsers)
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
