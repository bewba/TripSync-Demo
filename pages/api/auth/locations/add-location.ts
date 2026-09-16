import { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, lat, long } = req.body;

  if (!name || lat === undefined || long === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newLocation = demoStore.addLocation({ name, lat, long });
    return res.status(200).json(newLocation);
  } catch (error: any) {
    console.error('Error adding location:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
