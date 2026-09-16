import { NextApiRequest, NextApiResponse } from 'next';

// In demo mode, user deletion is a no-op — just return success
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Demo: simulate success
  return res.status(200).json({ message: 'User deleted successfully' });
}
