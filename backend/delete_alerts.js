const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.monitoringMessage.deleteMany({
    where: {
      channelName: {
        in: ['air_alert_ua', 'ukraine_alarm_bot', 'Офіційні Тривоги', 'Air Alert']
      }
    }
  });
  console.log('Deleted alert messages.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
