export interface AnalyticsEntry {
    date: string;
    truck: string;
    driver_name: string;
    total_distance: number;
    total_fuel: number;
    fuel_requested: number;
}

export interface ChartPoint {
    date: string;
    total_distance: number;
    total_fuel: number;
    fuel_requested: number;
    trucks: string[];
    drivers: string[];
}

// groups array of trip analytics entries by date, sums total distance and fuel per day
export function groupByDate(data: AnalyticsEntry[]): ChartPoint[] {
    const map = new Map<string, ChartPoint>();

    for (const entry of data) {
        const dateKey = entry.date || 'Unknown';
        const existing = map.get(dateKey);
        const distance = Number(entry.total_distance) || 0;
        const fuel = Number(entry.total_fuel) || 0;
        const requested = Number(entry.fuel_requested) || 0;

        if (existing) {
            existing.total_distance = parseFloat((existing.total_distance + distance).toFixed(2));
            existing.total_fuel = parseFloat((existing.total_fuel + fuel).toFixed(2));
            existing.fuel_requested = parseFloat((existing.fuel_requested + requested).toFixed(2));
            if (entry.truck && !existing.trucks.includes(entry.truck)) {
                existing.trucks.push(entry.truck);
            }
            if (entry.driver_name && !existing.drivers.includes(entry.driver_name)) {
                existing.drivers.push(entry.driver_name);
            }
        } else {
            map.set(dateKey, {
                date: dateKey,
                total_distance: distance,
                total_fuel: fuel,
                fuel_requested: requested,
                trucks: entry.truck && entry.truck !== 'Unknown' ? [entry.truck] : [],
                drivers: entry.driver_name && entry.driver_name !== 'Unknown' ? [entry.driver_name] : [],
            });
        }
    }

    // Return sorted chronologically
    return Array.from(map.values())
        .filter((point) => point.date !== 'Unknown')
        .sort((a, b) => a.date.localeCompare(b.date));
}
