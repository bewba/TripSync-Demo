import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Missing vehicle ID' });
  }

  try {
    const deleted = demoStore.deleteVehicle(id as string);

    if (!deleted) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    return res.status(200).json({ message: 'Vehicle deleted successfully!' });
  } catch (error: any) {
    console.error('Failed to delete vehicle:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}
