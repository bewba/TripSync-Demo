import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const stats = demoStore.getFleetStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Failed to fetch fleet stats:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
