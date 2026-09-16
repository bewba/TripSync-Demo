import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    page = '1',
    limit = '50',
    search = '',
    trip_id = '',
    level = '',
    sort = 'desc',
    from = '',
    to = '',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit as string)));

  try {
    const { data, count } = demoStore.getLogs({
      page: pageNum,
      limit: limitNum,
      search: search as string || undefined,
      trip_id: trip_id as string || undefined,
      level: level as string || undefined,
      sort: sort as string,
      from: from as string || undefined,
      to: to as string || undefined,
    });

    return res.status(200).json({
      logs: data,
      total: count,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err: any) {
    console.error('Unhandled error in logs API:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
