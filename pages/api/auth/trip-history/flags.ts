import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { trip_id } = req.query;

  if (!trip_id || Array.isArray(trip_id)) {
    return res.status(400).json({ error: 'trip_id is required' });
  }

  try {
    const flags = demoStore.getDriverFlags(trip_id as string);
    return res.status(200).json(flags);
  } catch (error: any) {
    console.error('Failed to fetch driver flags:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
