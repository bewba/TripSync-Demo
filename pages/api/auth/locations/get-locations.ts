import { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const locations = demoStore.getLocations();
    return res.status(200).json(locations);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
