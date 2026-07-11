const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const t = await prisma.threatObject.findMany({ where: { status: 'ACTIVE' }, include: { locations: true } });
  console.log("Total active threats:", t.length);
  for (const th of t) {
      console.log(`- ${th.type} at ${th.locations[0]?.lat}, ${th.locations[0]?.lng}`);
  }
}
main().finally(()=>prisma.$disconnect());
