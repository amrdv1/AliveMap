const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const t = await prisma.threatObject.findMany({ where: { status: 'ACTIVE' }, include: { locations: true } });
  console.log('Active threats:', t.length);
  if(t.length>0) console.log('First threat source:', t[0].locations[0]?.sourceId);
  const src = await prisma.source.findFirst({ where: { name: 'Telegram Worker' }});
  console.log('Telegram Worker ID:', src?.id);
}
main().finally(()=>prisma.$disconnect());
