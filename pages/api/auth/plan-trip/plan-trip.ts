import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    const newTrip = demoStore.createTrip({
      requestInfo: formData.requestInfo,
      locationInfo: formData.locationInfo,
      inventoryItems: formData.inventoryItems,
      fuelRequirement: formData.fuelRequirement,
      estimatedTripTime: formData.estimatedTripTime,
      useToll: formData.locationInfo?.applyToll ?? true,
    });

    return res.status(201).json({
      message: 'Trip created and fleet updated successfully',
      data: newTrip,
    });
  } catch (error: any) {
    console.error('API Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}