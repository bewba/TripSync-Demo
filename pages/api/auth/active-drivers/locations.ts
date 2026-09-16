import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const locations = demoStore.getActiveTruckLocations();
    return res.status(200).json(locations);
  } catch (error: any) {
    console.error('Failed to fetch active driver locations:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
