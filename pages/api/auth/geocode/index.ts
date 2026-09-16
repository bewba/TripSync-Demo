import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter (q)' });
  }

  try {
    const result = demoStore.geocode(q);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Geocode error:', error);
    return res.status(500).json({ error: 'Failed to geocode address' });
  }
}