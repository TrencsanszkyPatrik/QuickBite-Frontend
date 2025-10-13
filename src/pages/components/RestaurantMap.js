import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../components/css/homepage.css';

export default function RestaurantMap({ restaurants = [] }) {
    // Ha nincsenek éttermek, Miskolc központot használjuk alapértelmezettként
    const defaultCenter = [48.1031, 20.7784];
    
    // Ha vannak éttermek, számítsuk ki a középpontot
    const mapCenter = restaurants.length > 0 
        ? [
            restaurants.reduce((sum, r) => sum + r.latitude, 0) / restaurants.length,
            restaurants.reduce((sum, r) => sum + r.longitude, 0) / restaurants.length
          ]
        : defaultCenter;

    return (
        <div className="map-section">
            <div className="map-header">📍 Közelben lévő éttermek</div>
            <MapContainer
                center={mapCenter}
                zoom={restaurants.length > 0 ? 12 : 13}
                scrollWheelZoom={true}
                style={{ height: '400px', width: '100%', borderRadius: '18px', margin: '0 auto' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {restaurants.map((restaurant) => (
                    <Marker key={restaurant.id} position={[restaurant.latitude, restaurant.longitude]}>
                        <Popup>
                            <strong>{restaurant.name}</strong>
                            <br />
                            {restaurant.description}
                            <br />
                            <small>{restaurant.city}, {restaurant.addressLine1}</small>
                            <br />
                            <small>Min. rendelés: {restaurant.minOrderAmount} Ft</small>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
