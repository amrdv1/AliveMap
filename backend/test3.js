const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function run() { const subs = await prisma.telegramSubscriber.findMany(); console.log(subs); } run();  
