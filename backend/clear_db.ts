import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearThreats() {
    console.log("Deleting all ThreatLocation records...");
    await prisma.threatLocation.deleteMany({});
    
    console.log("Deleting all ThreatObject records...");
    await prisma.threatObject.deleteMany({});
    
    console.log("Database cleared of all threats.");
    await prisma.$disconnect();
}

clearThreats().catch(e => {
    console.error(e);
    prisma.$disconnect();
});
