// pages/api/auth/trip-history/static-map.ts
//
// Server-side proxy for Geoapify static map POST requests.
// The browser sends the polyline JSON body here; we forward it to
// Geoapify and pipe the image back. This sidesteps the 2048-character
// GET URL limit that breaks long-trip maps.

import type { NextApiRequest, NextApiResponse } from 'next';

const GEOAPIFY_STATIC_MAP = 'https://maps.geoapify.com/v1/staticmap';

export const config = {
    api: { bodyParser: { sizeLimit: '4mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Geoapify API key not configured' });
    }

    const params = new URLSearchParams({
        apiKey,
    });

    const body = req.body;

    try {
        const upstream = await fetch(`${GEOAPIFY_STATIC_MAP}?${params.toString()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!upstream.ok) {
            const errText = await upstream.text().catch(() => '');
            console.error('[static-map proxy] Geoapify error:', upstream.status, errText);
            return res.status(upstream.status).json({ error: errText || 'Geoapify request failed' });
        }

        const contentType = upstream.headers.get('content-type') ?? 'image/png';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');

        const arrayBuffer = await upstream.arrayBuffer();
        res.status(200).send(Buffer.from(arrayBuffer));
    } catch (err: any) {
        console.error('[static-map proxy] fetch error:', err);
        res.status(500).json({ error: err?.message ?? 'Unknown error' });
    }
}
