import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id, truck_id, truck_name, status, fuel_efficiency, metric_type, engine_type, plate_number, driverId } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Missing vehicle ID' });
  }

  try {
    const result = demoStore.updateVehicle(id, {
      truck_id: truck_id?.toUpperCase(),
      truck_name,
      driver: driverId,
      status,
      fuel_efficiency: typeof fuel_efficiency === 'number' ? fuel_efficiency : parseFloat(fuel_efficiency),
      metric_type,
      engine_type,
      plate_number: plate_number?.toUpperCase(),
    });

    if (!result) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    return res.status(200).json({ message: 'Vehicle updated successfully!', result });
  } catch (error: any) {
    console.error('Failed to update vehicle:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}
