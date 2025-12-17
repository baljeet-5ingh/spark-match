// utils/calc-distance.ts

export function getDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;

  const R = 6371; // Earth radius in KM

  const d =
    R *
    Math.acos(
      Math.sin(toRad(from.lat)) * Math.sin(toRad(to.lat)) +
        Math.cos(toRad(from.lat)) *
          Math.cos(toRad(to.lat)) *
          Math.cos(toRad(to.lng - from.lng))
    );

  return Number.isNaN(d) ? Infinity : d;
}
