import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Trip ID is required' });
  }

  try {
    const detail = demoStore.getTripDetail(id as string);

    if (!detail) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    return res.status(200).json(detail);
  } catch (error: any) {
    console.error('Failed to fetch trip detail:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
