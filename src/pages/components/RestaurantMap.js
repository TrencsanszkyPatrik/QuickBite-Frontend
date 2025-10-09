import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../components/css/homepage.css';

//Ehelyett majd Fetch lesz, a saját adatbázisból
const miskolcRestaurants = [
    {
        name: "Anyukám Mondta",
        position: [48.1046, 20.7915],
        description: "Kedvelt olasz étterem Miskolc közelében."
    },
    {
        name: "Végállomás Bistorant",
        position: [48.0996, 20.7786],
        description: "Modern magyar konyha, helyi alapanyagokkal."
    },
    {
        name: "Zip's Brewhouse",
        position: [48.1042, 20.7917],
        description: "Kézműves sörök és gasztro pub."
    },
    {
        name: "Calypso Kisvendéglő",
        position: [48.0991, 20.7837],
        description: "Hagyományos magyar ételek barátságos környezetben."
    }
];
export default function RestaurantMap() {
    const miskolcCenter = [48.1031, 20.7784];

    return (
        <div className="map-section">
            <div className="map-header">📍 Közelben lévő éttermek</div>
            <MapContainer
                center={miskolcCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '400px', width: '100%', borderRadius: '18px', margin: '0 auto' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {miskolcRestaurants.map((restaurant, idx) => (
                    <Marker key={idx} position={restaurant.position}>
                        <Popup>
                            <strong>{restaurant.name}</strong>
                            <br />
                            {restaurant.description}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
