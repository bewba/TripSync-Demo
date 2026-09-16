// pages/api/geocode/reverse.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Missing coordinates' });
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Send back the data as JSON
        res.status(200).json(data);
    } catch (error) {
        console.error('Reverse Geocoding Error:', error);
        res.status(500).json({ error: 'Failed to fetch address' });
    }
}