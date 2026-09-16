import { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Missing location ID' });
  }

  try {
    const deleted = demoStore.deleteLocation(id as string);

    if (!deleted) {
      return res.status(404).json({ message: 'Location not found' });
    }

    return res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting location:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
