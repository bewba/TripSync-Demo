import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

/**
 * POST /api/auth/logs/resolve-users
 * Body: { ids: string[] }
 * Returns: { [user_id]: { username: string } }
 *
 * Batch-resolves driver IDs to usernames for the logs viewer.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { ids } = req.body as { ids?: string[] };

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(200).json({});
  }

  const uniqueIds = Array.from(new Set(ids)).slice(0, 200);

  try {
    const allDrivers = demoStore.getDrivers();
    const map: Record<string, { username: string }> = {};

    uniqueIds.forEach((id) => {
      const driver = allDrivers.find((d: any) => d.id === id || d.username === id);
      if (driver) {
        map[id] = { username: driver.username };
      }
    });

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(map);
  } catch (err: any) {
    console.error('[resolve-users] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
