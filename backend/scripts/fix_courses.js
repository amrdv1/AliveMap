const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function deg2rad(deg) { return deg * (Math.PI/180); }
function rad2deg(rad) { return rad * (180/Math.PI); }
function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(deg2rad(lon2-lon1)) * Math.cos(deg2rad(lat2));
  const x = Math.cos(deg2rad(lat1))*Math.sin(deg2rad(lat2)) - Math.sin(deg2rad(lat1))*Math.cos(deg2rad(lat2))*Math.cos(deg2rad(lon2-lon1));
  const brng = Math.atan2(y, x);
  return (rad2deg(brng) + 360) % 360;
}

async function fixCourses() {
  const threats = await prisma.threatObject.findMany({
    where: { status: 'ACTIVE', targetLat: { not: null }, targetLng: { not: null } },
    include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
  });
  
  let updated = 0;
  for (const t of threats) {
    if (t.locations.length > 0) {
      const loc = t.locations[0];
      const correctCourse = calculateBearing(loc.lat, loc.lng, t.targetLat, t.targetLng);
      if (Math.abs((t.course || 0) - correctCourse) > 5) {
        console.log(`Fixing threat ${t.id} from course ${t.course} to ${correctCourse}`);
        await prisma.threatObject.update({
          where: { id: t.id },
          data: { course: correctCourse }
        });
        updated++;
      }
    }
  }
  console.log('Fixed courses for ' + updated + ' threats.');
}

fixCourses().catch(console.error).finally(() => prisma.$disconnect());
