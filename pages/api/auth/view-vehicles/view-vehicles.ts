import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { planner, q, limit, page } = req.query;

    const opts = {
      planner: planner === 'true',
      q: q as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
    };

    const { data, count } = demoStore.getVehicles(opts);

    if (opts.page) {
      return res.status(200).json({ data, total: count });
    } else {
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error('Failed to fetch trucks:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}