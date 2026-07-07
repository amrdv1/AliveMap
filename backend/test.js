const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const msgs = await prisma.monitoringMessage.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10
    });
    console.log(msgs.map(m => m.text).join('\n---\n'));
}
run();
