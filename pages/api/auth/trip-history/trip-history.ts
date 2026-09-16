import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page = '1', limit = '10', searchQuery, status } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  try {
    const { data: trips, count: total } = demoStore.getTrips({
      page: pageNum,
      limit: limitNum,
      searchQuery: searchQuery as string | undefined,
      status: status as string | undefined,
    });

    if (!trips || trips.length === 0) {
      return res.status(200).json({ trips: [], total: 0 });
    }

    return res.status(200).json({ trips, total });
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}