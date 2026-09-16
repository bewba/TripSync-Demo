import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { firstName, lastName, password } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'First name and last name are required' });
  }

  const suffix = Math.floor(1000 + Math.random() * 9000);
  const dummyEmail = `${firstName.toLowerCase()}${lastName.toLowerCase()}${suffix}@demofleet.ph`;
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${suffix}`;

  try {
    const newDriver = demoStore.createDriver({
      username,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      email: dummyEmail,
    });

    return res.status(200).json({
      user: newDriver,
      email: dummyEmail,
      username,
    });
  } catch (error: any) {
    console.error('System error:', error);
    return res.status(500).json({ message: error.message });
  }
}