import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { q, limit } = req.query;

    const opts = {
      q: q as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    };

    const drivers = demoStore.getDrivers(opts);
    return res.status(200).json(drivers);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
}