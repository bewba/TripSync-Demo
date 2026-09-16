import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { truckId, name, fuelEfficiency, metricType, engineType, plateNumber, status } = req.body;

  if (!truckId || !name || !fuelEfficiency || !metricType || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newVehicle = demoStore.addVehicle({
      truck_id: truckId.toUpperCase(),
      truck_name: name,
      fuel_efficiency: parseFloat(fuelEfficiency),
      metric_type: metricType,
      engine_type: engineType,
      plate_number: plateNumber?.toUpperCase(),
      status,
    });

    return res.status(200).json({ message: 'Vehicle added successfully!', result: newVehicle });
  } catch (error: any) {
    console.error('Failed to add truck:', error);
    return res.status(403).json({ message: error.message || 'Internal Server Error' });
  }
}