const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.threatObject.findMany({ where: { type: 'FPV' }, include: { locations: true } }).then(d => {
  console.log(JSON.stringify(d, null, 2));
  prisma.$disconnect();
});
