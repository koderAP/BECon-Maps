'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';

// Fix for default markers in Leaflet with Next.js
const fixIcons = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
};

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const Map = ({
    locations = [],
    onMapClick
}: {
    locations?: any[],
    onMapClick?: (lat: number, lng: number) => void
}) => {
    useEffect(() => {
        fixIcons();
    }, []);

    return (
        <MapContainer
            center={[28.5450, 77.1926]}
            zoom={16}
            style={{ height: '100%', width: '100%', background: '#05020a' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="map-tiles"
            />
            {onMapClick && <MapEvents onMapClick={onMapClick} />}
            {locations.map((loc) => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                    <Popup>
                        <div className="text-center">
                            <h3 className="font-bold text-black">{loc.name}</h3>
                            <p className="text-gray-600 text-xs">{loc.description}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
