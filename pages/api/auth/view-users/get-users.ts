import { NextApiRequest, NextApiResponse } from 'next';

// Demo users that represent the system accounts available in the demo
const DEMO_USERS = [
  { id: 'demo-admin-001', name: 'Fleet Admin', email: 'admin@demofleet.ph', role: 'admin' },
  { id: 'demo-dispatcher-001', name: 'Dispatcher Santos', email: 'dispatcher@demofleet.ph', role: 'dispatcher' },
  { id: 'demo-superadmin-001', name: 'Super Admin', email: 'superadmin@demofleet.ph', role: 'superadmin' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return res.status(200).json(DEMO_USERS);
}
