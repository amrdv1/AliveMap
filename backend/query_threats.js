const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const threats = await prisma.threatObject.findMany({
        where: { status: 'ACTIVE' },
        include: { locations: true }
    });
    console.log(JSON.stringify(threats, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
