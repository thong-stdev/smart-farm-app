import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Create admin user
    const adminPassword = await hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@smartfarm.com' },
        update: {},
        create: {
            email: 'admin@smartfarm.com',
            username: 'admin',
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
        },
    })
    console.log('✓ Created admin user:', admin.email)

    // Create sample farmer
    const farmerPassword = await hash('farmer123', 10)
    const farmer = await prisma.user.upsert({
        where: { email: 'farmer@example.com' },
        update: {},
        create: {
            email: 'farmer@example.com',
            username: 'farmer1',
            name: 'John Farmer',
            password: farmerPassword,
            role: 'FARMER',
        },
    })
    console.log('✓ Created sample farmer:', farmer.email)

    // Create crop types
    const rice = await prisma.cropType.upsert({
        where: { name: 'Rice' },
        update: {},
        create: {
            name: 'Rice',
            nameEn: 'Rice',
            nameTh: 'ข้าว',
            description: 'Staple grain crop',
            icon: '🌾',
        },
    })

    const vegetables = await prisma.cropType.upsert({
        where: { name: 'Vegetables' },
        update: {},
        create: {
            name: 'Vegetables',
            nameEn: 'Vegetables',
            nameTh: 'ผัก',
            description: 'Various vegetable crops',
            icon: '🥬',
        },
    })

    const fruits = await prisma.cropType.upsert({
        where: { name: 'Fruits' },
        update: {},
        create: {
            name: 'Fruits',
            nameEn: 'Fruits',
            nameTh: 'ผลไม้',
            description: 'Fruit crops',
            icon: '🍎',
        },
    })
    console.log('✓ Created crop types: Rice, Vegetables, Fruits')

    // Create rice varieties
    const jasmine105 = await prisma.cropVariety.upsert({
        where: {
            cropTypeId_name: {
                cropTypeId: rice.id,
                name: 'Jasmine 105'
            }
        },
        update: {},
        create: {
            cropTypeId: rice.id,
            name: 'Jasmine 105',
            nameEn: 'Jasmine 105',
            nameTh: 'ข้าวหอมมะลิ 105',
            description: 'Premium fragrant rice variety',
            growthPeriodDays: 120,
        },
    })

    const riceberry = await prisma.cropVariety.upsert({
        where: {
            cropTypeId_name: {
                cropTypeId: rice.id,
                name: 'Riceberry'
            }
        },
        update: {},
        create: {
            cropTypeId: rice.id,
            name: 'Riceberry',
            nameEn: 'Riceberry',
            nameTh: 'ข้าวไรซ์เบอร์รี่',
            description: 'Purple rice with health benefits',
            growthPeriodDays: 130,
        },
    })
    console.log('✓ Created rice varieties')

    // Create vegetable varieties
    const chineseCabbage = await prisma.cropVariety.upsert({
        where: {
            cropTypeId_name: {
                cropTypeId: vegetables.id,
                name: 'Chinese Cabbage'
            }
        },
        update: {},
        create: {
            cropTypeId: vegetables.id,
            name: 'Chinese Cabbage',
            nameEn: 'Chinese Cabbage',
            nameTh: 'ผักกาดขาว',
            description: 'Fast-growing leafy vegetable',
            growthPeriodDays: 45,
        },
    })
    console.log('✓ Created vegetable varieties')

    // Create standard plan for Jasmine 105
    const jasminePlan = await prisma.standardPlan.create({
        data: {
            cropVarietyId: jasmine105.id,
            name: 'Standard Jasmine Rice Plan',
            description: 'Standard planting plan for Jasmine 105 rice',
            tasks: {
                create: [
                    {
                        title: 'Prepare soil',
                        description: 'Plow and level the field, prepare irrigation',
                        dayFromStart: 0,
                        activityType: 'SOIL_PREPARATION',
                    },
                    {
                        title: 'Plant rice seedlings',
                        description: 'Transplant 30-day old seedlings',
                        dayFromStart: 7,
                        activityType: 'PLANTING',
                    },
                    {
                        title: 'First fertilization',
                        description: 'Apply base fertilizer (16-20-0)',
                        dayFromStart: 14,
                        activityType: 'FERTILIZING',
                    },
                    {
                        title: 'Weed control',
                        description: 'Remove weeds from field',
                        dayFromStart: 30,
                        activityType: 'WEEDING',
                    },
                    {
                        title: 'Second fertilization',
                        description: 'Apply nitrogen fertilizer (46-0-0)',
                        dayFromStart: 45,
                        activityType: 'FERTILIZING',
                    },
                    {
                        title: 'Pest inspection',
                        description: 'Check for pests and apply treatment if needed',
                        dayFromStart: 60,
                        activityType: 'PEST_CONTROL',
                    },
                    {
                        title: 'Final fertilization',
                        description: 'Apply final round of fertilizer',
                        dayFromStart: 75,
                        activityType: 'FERTILIZING',
                    },
                    {
                        title: 'Harvest',
                        description: 'Harvest rice when grains are golden and firm',
                        dayFromStart: 120,
                        activityType: 'HARVESTING',
                    },
                ],
            },
        },
    })
    console.log('✓ Created standard planting plan for Jasmine 105')

    // Create standard plan for Chinese Cabbage
    const cabbagePlan = await prisma.standardPlan.create({
        data: {
            cropVarietyId: chineseCabbage.id,
            name: 'Standard Chinese Cabbage Plan',
            description: 'Quick-growing vegetable plan',
            tasks: {
                create: [
                    {
                        title: 'Prepare raised beds',
                        description: 'Create raised beds with good drainage',
                        dayFromStart: 0,
                        activityType: 'SOIL_PREPARATION',
                    },
                    {
                        title: 'Sow seeds',
                        description: 'Direct sow or transplant seedlings',
                        dayFromStart: 3,
                        activityType: 'PLANTING',
                    },
                    {
                        title: 'First watering',
                        description: 'Ensure consistent moisture',
                        dayFromStart: 5,
                        activityType: 'IRRIGATION',
                    },
                    {
                        title: 'Thinning',
                        description: 'Thin plants to 30cm spacing',
                        dayFromStart: 15,
                        activityType: 'WEEDING',
                    },
                    {
                        title: 'Fertilize',
                        description: 'Apply organic fertilizer',
                        dayFromStart: 20,
                        activityType: 'FERTILIZING',
                    },
                    {
                        title: 'Harvest',
                        description: 'Harvest when heads are firm and full',
                        dayFromStart: 45,
                        activityType: 'HARVESTING',
                    },
                ],
            },
        },
    })
    console.log('✓ Created standard planting plan for Chinese Cabbage')

    console.log('🎉 Seed completed successfully!')
    console.log('\nLogin credentials:')
    console.log('Admin: admin@smartfarm.com / admin123')
    console.log('Farmer: farmer@example.com / farmer123')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
