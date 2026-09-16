import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing start or end date parameter.' });
  }

  try {
    const { data: trips } = demoStore.getTrips({
      from: startDate as string,
      to: endDate as string,
    } as any);

    // Return raw trips matching the date range for the PDF report generator
    return res.status(200).json(trips || []);
  } catch (error: any) {
    console.error('Error compiling trip history report:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}