const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const subs = await prisma.telegramSubscriber.findMany();
    const seen = new Set();
    let deleted = 0;
    for (const sub of subs) {
        const key = `${sub.chatId}-${sub.region}`;
        if (seen.has(key)) {
            await prisma.telegramSubscriber.delete({ where: { id: sub.id } });
            deleted++;
        } else {
            seen.add(key);
        }
    }
    console.log(`Deleted ${deleted} duplicate subscriptions`);
}
run();
