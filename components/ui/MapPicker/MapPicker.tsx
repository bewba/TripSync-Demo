'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default Leaflet icons in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            // .flyTo provides a smooth animation to the new pin
            map.flyTo(center, 16)
        }
    }, [center, map])
    return null
}

function MapEvents({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

interface MapPickerProps {
    initialLat?: number
    initialLng?: number
    onChange: (lat: number, lng: number) => void
}

// MapPicker.tsx

export default function MapPicker({ initialLat, initialLng, onChange }: MapPickerProps) {
    // Determine the active position
    // If the parent passes new coordinates (from search), they take priority 
    // unless the user clicks.
    const currentPos: [number, number] | null =
        initialLat && initialLng ? [initialLat, initialLng] : null;

    // Default center if no position exists (Manila)
    const center: [number, number] = currentPos ?? [14.5995, 120.9842];

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={center}
                zoom={15}
                className="h-full w-full"
            >
                <TileLayer url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'e520b867332a41708a3ac5a694477ae5'}`} />

                {/* 1. This moves the camera automatically when currentPos changes */}
                <ChangeView center={center} />

                {/* 2. This listens for new clicks */}
                <MapEvents onSelect={onChange} />

                {/* 3. The Pin: It now renders automatically if currentPos exists */}
                {currentPos && (
                    <Marker position={currentPos} icon={icon} />
                )}
            </MapContainer>
        </div>
    );
}
