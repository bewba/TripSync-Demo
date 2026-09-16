import { useState, useCallback } from 'react';

export const useHydrateTripReport = () => {
    const [isHydrating, setIsHydrating] = useState(false);
    const [progressText, setProgressText] = useState('');

    const hydrateTripsData = useCallback(async (
        baseTrips: any[],
        fetchCoordinates: (tripId: string) => Promise<any[]>,
        fetchDriverFlags: (tripId: string) => Promise<any[]>
    ) => {
        setIsHydrating(true);
        setProgressText('Generating Report Please Wait...');
        try {
            const hydrated = await Promise.all(
                baseTrips.map(async (trip) => {
                    const tripId = trip.id;
                    let coords = [];
                    let flags = [];
                    try {
                        [coords, flags] = await Promise.all([
                            fetchCoordinates(tripId).catch((err) => {
                                console.error(`Error fetching coordinates for trip ${tripId}:`, err);
                                return [];
                            }),
                            fetchDriverFlags(tripId).catch((err) => {
                                console.error(`Error fetching flags for trip ${tripId}:`, err);
                                return [];
                            }),
                        ]);
                    } catch (error) {
                        console.error(`Error fetching for trip ${tripId}:`, error);
                        return [];
                    }

                    return {
                        ...trip,
                        coordinates: coords || [],
                        flags: flags || [],
                    };
                })
            );
            return hydrated;
        } catch (error) {
            console.error('Error during trip hydration:', error);
            throw error;
        } finally {
            setIsHydrating(false);
            setProgressText('');
        }
    }, []);

    return { hydrateTripsData, isHydrating, progressText };
};