const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const threats = await prisma.threatObject.findMany({ where: { status: 'ACTIVE' } });
    console.log(JSON.stringify(threats.map(t => ({ id: t.id, type: t.type, lat: t.lat, lng: t.lng })), null, 2));
}
run();
