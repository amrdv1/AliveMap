import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const threats = await prisma.threatObject.findMany({
    where: { status: 'ACTIVE' },
    include: { locations: true }
  });
  console.log(JSON.stringify(threats, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
