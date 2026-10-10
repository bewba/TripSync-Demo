'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Precision SVG pin icon anchored exactly to the needle tip at [16, 40]
const createPinIcon = () => {
    if (typeof window === 'undefined') return undefined;
    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `
            <div style="
                position: relative;
                width: 32px;
                height: 40px;
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));
                pointer-events: none;
            ">
                <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.16344 0 0 7.16344 0 16C0 26 16 40 16 40C16 40 32 26 32 16C32 7.16344 24.8366 0 16 0Z" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
                    <circle cx="16" cy="15" r="5" fill="#ffffff"/>
                </svg>
            </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
    });
};

function MapController({ initialPos }: { initialPos: [number, number] | null }) {
    const map = useMap();
    const hasCenteredRef = useRef(false);

    // Invalidate size when map renders in dynamic dropdown safely
    useEffect(() => {
        if (!map) return;
        try {
            map.invalidateSize();
            const t1 = setTimeout(() => {
                try {
                    if (map.getContainer?.()) map.invalidateSize();
                } catch {}
            }, 120);
            const t2 = setTimeout(() => {
                try {
                    if (map.getContainer?.()) map.invalidateSize();
                } catch {}
            }, 350);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        } catch {}
    }, [map]);

    // Center on initial position only once on load if valid
    useEffect(() => {
        if (!map) return;
        if (initialPos && !hasCenteredRef.current) {
            hasCenteredRef.current = true;
            try {
                map.setView(initialPos, 14);
            } catch {}
        }
    }, [initialPos, map]);

    return null;
}

function MapEvents({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

interface MapPickerProps {
    initialLat?: number;
    initialLng?: number;
    onChange: (lat: number, lng: number) => void;
}

export default function MapPicker({ initialLat, initialLng, onChange }: MapPickerProps) {
    const isValidCoord = (lat?: number, lng?: number) =>
        typeof lat === 'number' && typeof lng === 'number' && lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng);

    const initialPos: [number, number] | null =
        isValidCoord(initialLat, initialLng) ? [initialLat!, initialLng!] : null;

    const [pinPos, setPinPos] = useState<[number, number] | null>(initialPos);

    // Keep pin in sync if parent coordinates update externally
    useEffect(() => {
        if (isValidCoord(initialLat, initialLng)) {
            setPinPos([initialLat!, initialLng!]);
        }
    }, [initialLat, initialLng]);

    // Default center Manila with overview zoom 11
    const defaultCenter: [number, number] = initialPos ?? [14.5995, 120.9842];
    const defaultZoom = initialPos ? 14 : 11;

    const [pinIcon] = useState(() => createPinIcon());

    const handleSelect = (lat: number, lng: number) => {
        setPinPos([lat, lng]);
        onChange(lat, lng);
    };

    return (
        <div
            className="h-full w-full relative select-none [&_.leaflet-container]:cursor-crosshair"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="h-full w-full z-0"
                scrollWheelZoom={true}
                dragging={true}
            >
                <TileLayer
                    url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'e520b867332a41708a3ac5a694477ae5'}`}
                />

                <MapController initialPos={initialPos} />
                <MapEvents onSelect={handleSelect} />

                {pinPos && pinIcon && <Marker position={pinPos} icon={pinIcon} />}
            </MapContainer>
        </div>
    );
}
