import { NextApiRequest, NextApiResponse } from 'next';

// In demo mode, role updates are a no-op — just return success
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, role } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Demo: simulate success
  return res.status(200).json({ message: 'User role updated successfully', data: { id, role } });
}
