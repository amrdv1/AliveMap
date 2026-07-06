import * as turf from '@turf/turf';

export interface TrajectoryProjection {
    currentLat: number;
    currentLng: number;
    predictedLat: number;
    predictedLng: number;
    distanceCoveredKm: number;
    timeMinutes: number;
}

/**
 * Calculates where an object will be after a given time based on its speed and course.
 */
export function projectTrajectory(
    lat: number, 
    lng: number, 
    speedKmh: number, 
    courseDegrees: number, 
    timeMinutes: number = 30
): TrajectoryProjection {
    const point = turf.point([lng, lat]);
    const distanceKm = (speedKmh / 60) * timeMinutes;
    
    // turf destination uses bearing (-180 to 180). course is 0-360.
    const bearing = courseDegrees > 180 ? courseDegrees - 360 : courseDegrees;
    
    const destination = turf.destination(point, distanceKm, bearing, { units: 'kilometers' as any });
    const coords = destination.geometry.coordinates;

    return {
        currentLat: lat,
        currentLng: lng,
        predictedLat: coords[1],
        predictedLng: coords[0],
        distanceCoveredKm: distanceKm,
        timeMinutes
    };
}

/**
 * Checks if a trajectory intersects a given city/location within a certain radius.
 */
export function willIntersectLocation(
    trajectory: TrajectoryProjection,
    targetLat: number,
    targetLng: number,
    radiusKm: number = 20
): boolean {
    const line = turf.lineString([
        [trajectory.currentLng, trajectory.currentLat],
        [trajectory.predictedLng, trajectory.predictedLat]
    ]);
    const targetPoint = turf.point([targetLng, targetLat]);
    
    // Distance from the point to the closest segment of the line
    const distance = (turf as any).pointToLineDistance(targetPoint, line, { units: 'kilometers' as any });
    return distance <= radiusKm;
}
