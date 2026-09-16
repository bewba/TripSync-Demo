import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { driverId, truckId, from, to } = req.query;

  try {
    const data = demoStore.getAnalytics({
      from: from as string | undefined,
      to: to as string | undefined,
      truckId: truckId as string | undefined,
      driverId: driverId as string | undefined,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Analytics fetch failed:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
