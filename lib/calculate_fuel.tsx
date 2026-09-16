export function calculateTruckerFuel(
    distanceKm: number,
    elevationGainM: number, // Total meters climbed
    baseL100km: number,     // e.g., 30L/100km
    weightTonnes: number    // e.g., 20
) {
    // 1. Base Fuel (The "Empty & Flat" baseline)
    let fuel = (baseL100km / 100) * distanceKm;

    // 2. Weight Impact
    // Rule of thumb: Consumption increases ~0.5% per tonne per 100km
    const weightPenalty = (weightTonnes * 0.005) * baseL100km * (distanceKm / 100);
    fuel += weightPenalty;

    // 3. Elevation Impact (The "Climb" penalty)
    // It takes significantly more energy to lift weight vertically.
    // We apply a penalty for every 100m of total elevation gain.
    if (elevationGainM > 0) {
        const elevationPenalty = (elevationGainM / 100) * (weightTonnes * 0.02);
        fuel += elevationPenalty;
    }

    // 4. Final Safety Buffer (Standard 3% for idling/auxiliary)
    fuel *= 1.03;

    return parseFloat(fuel.toFixed(2));
}