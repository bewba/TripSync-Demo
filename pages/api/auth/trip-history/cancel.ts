import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ message: 'Trip ID is required' });
    }

    const success = demoStore.cancelTrip(tripId);

    if (!success) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    return res.status(200).json({ message: 'Trip successfully cancelled' });
  } catch (error: any) {
    console.error('Failed to cancel trip:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
